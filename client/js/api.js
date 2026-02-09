// js/api.js

async function tryFetchInternal(url, payload, mainContext) {
    // ... (this function remains the same)
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorBodyForLog = `Server error ${response.status}`;
            try { errorBodyForLog = await response.text(); } catch (_) {}
            console.error(`API Error from ${url}: ${response.status}`, errorBodyForLog.substring(0, 500));
            return { success: false, data: null, errorStatus: response.status };
        }

        const data = await response.json();
        return { success: true, data: data, errorStatus: null };
    } catch (networkError) {
        console.warn(`Network/Fetch Error from ${url}:`, networkError.message);
        return { success: false, data: null, errorStatus: 'NETWORK_ERROR' };
    }
}

// Added shouldFocusAfterCompletion parameter to callJustinAI
export async function callJustinAI(queryText, callback, currentButton, mainContext, shouldFocusAfterCompletion = true) {
    const { state, ui, config, dom } = mainContext;

    if (!queryText || !queryText.trim()) {
        console.error("callJustinAI received an empty or whitespace queryText. Aborting.");
        ui.addMessage("I can't send an empty message. Please type something or select a suggestion.", 'bot');
        state.addMessageToHistory('model', "I can't send an empty message. Please type something or select a suggestion.");
        return;
    }

    state.setBotBusy(true, false); // Disable UI, don't focus yet
    const loadingElement = ui.showLoadingIndicator(); 
    let warmUpMessageTimerId = null;

    const currentChatHistory = [...state.chatHistory];
    const effectiveHistoryForAPI = currentChatHistory.slice(0, -1);
    const apiPayload = { query: queryText.trim(), history: effectiveHistoryForAPI };

    warmUpMessageTimerId = setTimeout(() => {
        if (loadingElement && loadingElement.parentNode === dom.chatWindow) {
            if (!dom.chatWindow.querySelector('.warm-up-message')) {
                const warmUpNode = document.createElement('div');
                warmUpNode.classList.add('message', 'bot', 'warm-up-message');
                warmUpNode.innerHTML = "Thinking... (If this is the first query, the server might be warming up, ~1 min).";
                dom.chatWindow.insertBefore(warmUpNode, loadingElement);
                dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
            }
        }
    }, 3500);

    let fetchResult = { success: false, data: null, errorStatus: null };
    const previouslyActiveBackendUrl = state.getActiveBackendUrl();
    let finalActiveUrlForThisSession = previouslyActiveBackendUrl; 

    try {
        if (previouslyActiveBackendUrl) {
            console.log(`Using previously successful backend: ${previouslyActiveBackendUrl}`);
            fetchResult = await tryFetchInternal(previouslyActiveBackendUrl, apiPayload, mainContext);
            if (!fetchResult.success) {
                state.setActiveBackendUrl(null);
                console.log("Previously active backend failed. Will re-detect on next request.");
            }
        } else {
            if (config.IS_LOCAL_DEVELOPMENT) {
                console.log("IS_LOCAL_DEVELOPMENT is true. Trying localhost directly...");
                fetchResult = await tryFetchInternal(config.LOCAL_BACKEND_URL, apiPayload, mainContext);
                if (fetchResult.success) {
                    state.setActiveBackendUrl(config.LOCAL_BACKEND_URL);
                    finalActiveUrlForThisSession = config.LOCAL_BACKEND_URL;
                }
            } else {
                console.log("Attempting to connect to Render URL...");
                fetchResult = await tryFetchInternal(config.RENDER_BACKEND_URL, apiPayload, mainContext);
                if (fetchResult.success) {
                    state.setActiveBackendUrl(config.RENDER_BACKEND_URL);
                    finalActiveUrlForThisSession = config.RENDER_BACKEND_URL;
                } else {
                    console.log("Failed to connect to Render URL, trying localhost as a fallback...");
                    fetchResult = await tryFetchInternal(config.LOCAL_BACKEND_URL, apiPayload, mainContext);
                    if (fetchResult.success) {
                        state.setActiveBackendUrl(config.LOCAL_BACKEND_URL);
                        finalActiveUrlForThisSession = config.LOCAL_BACKEND_URL;
                    }
                }
            }
        }

        const existingWarmUp = dom.chatWindow.querySelector('.warm-up-message');
        if (existingWarmUp) existingWarmUp.remove();
        if (loadingElement && loadingElement.parentNode) ui.removeLoadingIndicator(loadingElement);

        if (fetchResult.success) {
            callback(fetchResult.data.response || "I received an empty response. Please try again.", currentButton);
        } else {
            let failureMessage = "Sorry, I couldn't connect to the AI assistant. ";
            // ... (failure message logic)
            ui.addMessage(failureMessage, 'bot');
            state.addMessageToHistory('model', failureMessage);
        }

    } catch (error) { 
        console.error("Critical error during AI call execution logic:", error);
        // ... (error handling)
    } finally {
        if (warmUpMessageTimerId) clearTimeout(warmUpMessageTimerId);
        if (loadingElement && loadingElement.parentNode) ui.removeLoadingIndicator(loadingElement);
        // Use shouldFocusAfterCompletion when re-enabling UI
        state.setBotBusy(false, shouldFocusAfterCompletion);
    }
}