// js/events/handlers.js

export function handleUserQueryInput(queryText, mainContext, shouldFocusAfterCompletion = false) {
    const { state, ui, api, dom } = mainContext;
    const trimmedQuery = queryText.trim();

    // Check if bot is busy (unless it's an internal suggestion)
    if (state.isBotBusy && !queryText.startsWith('Suggestion:')) {
        console.log("Bot is busy, user query ignored.");
        return;
    }
    if (!trimmedQuery) return;

    // UI Updates
    ui.addMessage(trimmedQuery, 'user'); 
    state.addMessageToHistory('user', trimmedQuery);
    if (dom.userInput) dom.userInput.value = '';

    // Specialized Logic: Local GRE Check
    const isGreQuery = /\bgre\b/i.test(trimmedQuery);

    if (isGreQuery) {
        state.setBotBusy(true, false); 
        const loadingElement = ui.showLoadingIndicator();
        
        fetch('content/GRE_Scores_Formatted.md')
            .then(res => res.ok ? res.text() : Promise.reject(res.status))
            .then(text => {
                ui.removeLoadingIndicator(loadingElement);
                ui.renderMarkdown(text, 'bot', mainContext); 
            })
            .catch(err => {
                ui.removeLoadingIndicator(loadingElement);
                console.error("GRE fetch error:", err);
                const msg = "Sorry, I couldn't retrieve the GRE scores information at the moment.";
                ui.addMessage(msg, 'bot');
                state.addMessageToHistory('model', msg);
            })
            .finally(() => state.setBotBusy(false, shouldFocusAfterCompletion));
    } else {
        // Standard AI Logic
        api.callJustinAI(trimmedQuery, (response) => {
            ui.renderMarkdown(response, 'bot', mainContext);
        }, null, mainContext, shouldFocusAfterCompletion);
    }
}

export function handleSuggestionButtonClick(btn, mainContext) {
    const { state, ui, services, config, dom } = mainContext;
    const type = btn.dataset.type;

    // Cooldown check
    if (state.isBotBusy && type === 'ai-query') return;
    if (state.buttonCooldowns.has(btn) || btn.disabled) return;

    // Apply visual cooldown
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
    state.buttonCooldowns.set(btn, setTimeout(() => {
        state.buttonCooldowns.delete(btn);
        if (!btn.disabled && btn.dataset.allShown !== 'true') {
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
        }
    }, config.BUTTON_COOLDOWN_MS));

    // Dispatcher
    const userMsg = btn.dataset.userDisplayMessage || btn.textContent.trim();
    ui.addMessage(userMsg, 'user');
    state.addMessageToHistory('user', userMsg);

    switch(type) {
        case 'ai-query-random-class':
            const result = services.courseManager.getRandomCourse();
            
            if (result.resetOccurred) {
                const msg = "You've heard about all of Justin's university and AP courses! The list has been reset.";
                ui.addMessage(msg, 'bot');
                state.addMessageToHistory('model', msg);
                // Re-enable button
                btn.textContent = "Tell me about a class Justin has taken";
                btn.disabled = false;
                btn.dataset.allShown = 'false';
            } else {
                const c = result.course;
                const md = `**Course:** ${c.name}\n\n**Institution:** ${c.institution} - ${c.term}\n\n**Description:** ${c.description}`;
                ui.renderMarkdown(md, 'bot', mainContext);
                
                if (result.allShown) {
                    btn.textContent = "All Classes Shown";
                    btn.disabled = true;
                    btn.dataset.allShown = 'true';
                }
            }
            break;

        case 'pdf':
            const details = services.documentManager.getPdfDetails(btn.dataset.pdf);
            if (details) {
                ui.addMessage(services.documentManager.generatePreviewHtml(details), 'bot', true, true);
                state.addMessageToHistory('model', `Displayed ${details.friendlyName}.`);
            } else {
                ui.addMessage("Sorry, document not found.", 'bot');
            }
            break;

        case 'random-image':
            const imgResult = services.galleryManager.getRandomImage();
            if (imgResult.error) {
                ui.addMessage(imgResult.error, 'bot');
            } else {
                if (imgResult.resetOccurred) {
                    const msg = "You've seen all the images! Resetting the viewer.";
                    ui.addMessage(msg, 'bot');
                    state.addMessageToHistory('model', msg);
                }
                
                const html = `
                    <div class="random-image-display-container">
                        <img src="portraits/${imgResult.imageName}" 
                             alt="Random: ${imgResult.imageName}" 
                             class="random-image-content"
                             onload="this.scrollIntoView({behavior: 'smooth', block: 'nearest'})">
                    </div>`;
                
                ui.addMessage(html, 'bot', true, true, ['message-contains-random-image']);
                state.addMessageToHistory('model', `Displayed image: ${imgResult.imageName}`);
                ui.addMessage(`${imgResult.count}/${imgResult.total}`, 'bot', false, false, ['image-counter-message']);
            }
            break;

        case 'local-markdown':
            state.setBotBusy(true, false);
            const loading = ui.showLoadingIndicator();
            fetch(btn.dataset.localFile)
                .then(r => r.text())
                .then(text => {
                    ui.removeLoadingIndicator(loading);
                    ui.renderMarkdown(text, 'bot', mainContext);
                })
                .finally(() => state.setBotBusy(false, false));
            break;
    }
}