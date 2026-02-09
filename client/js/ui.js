// js/ui.js

let chatWindowRef, userInputRef, sendBtnRef, suggestionBtnsRef;
let appContextRef;

export function initUIElements(elements) {
    chatWindowRef = elements.chatWindow;
    userInputRef = elements.userInput;
    sendBtnRef = elements.sendBtn;
    suggestionBtnsRef = elements.suggestionBtns;
}

export function initAppContext(context) {
    appContextRef = context;
}

export function scrollMessageToTop(messageElement) {
    if (!messageElement || !chatWindowRef) return;
    const chatWindowRect = chatWindowRef.getBoundingClientRect();
    const messageRect = messageElement.getBoundingClientRect();
    const offsetFromTop = 70; 
    const scrollBy = messageRect.top - chatWindowRect.top - offsetFromTop;
    chatWindowRef.scrollTop += scrollBy;
}

export function scrollImageMessageIntoView(messageContainerElement, imageElement) {
    if (!messageContainerElement || !chatWindowRef) {
        console.warn("Cannot scroll image message: container or chat window not found.");
        if (chatWindowRef) chatWindowRef.scrollTop = chatWindowRef.scrollHeight;
        return;
    }

    const chatWindowRect = chatWindowRef.getBoundingClientRect();
    const containerRect = messageContainerElement.getBoundingClientRect();
    const desiredOffsetFromTop = 20; 

    let scrollTargetY = containerRect.top; 

    if (imageElement && imageElement.offsetHeight > 0) {
        const imageRect = imageElement.getBoundingClientRect();
        scrollTargetY = imageRect.top;
    }
    
    const scrollBy = scrollTargetY - chatWindowRect.top - desiredOffsetFromTop;
    
    let finalScrollAmount = chatWindowRef.scrollTop + scrollBy;

    if (finalScrollAmount < 0) finalScrollAmount = 0;
    const maxScroll = chatWindowRef.scrollHeight - chatWindowRef.clientHeight;
    if (finalScrollAmount > maxScroll) finalScrollAmount = maxScroll;
    
    chatWindowRef.scrollTo({
        top: finalScrollAmount,
        behavior: 'smooth'
    });
}


export function addMessage(text, sender, isHtml = false, isLargeContentMsg = false, additionalClasses = []) {
    if (!chatWindowRef) {
        console.error("Chat window reference not initialized in ui.js");
        return null;
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender, ...additionalClasses);
    
    let contentForHistory = text;
    if (isHtml) {
        messageDiv.innerHTML = text;
    } else {
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        contentForHistory = text; 
    }
    
    if (isLargeContentMsg) messageDiv.classList.add('large-content-message');
    
    chatWindowRef.appendChild(messageDiv);
    
    const isSpecialMessage = additionalClasses.includes('image-counter-message') || additionalClasses.includes('warm-up-message') || additionalClasses.includes('message-contains-random-image');

    if (appContextRef && appContextRef.state && !messageDiv.querySelector('.loading-dots') && !isSpecialMessage) {
        const role = sender === 'user' ? 'user' : 'model';
        if (!isHtml || sender === 'user') { 
            // Handled by addMessageToHistory in script.js which now does trimming
            // appContextRef.state.addMessageToHistory(role, contentForHistory);
        }
    } else if (appContextRef && appContextRef.state && additionalClasses.includes('message-contains-random-image')) {
        // Textual representation for image messages added to history by event handler
    }
    
    if (!additionalClasses.includes('message-contains-random-image')) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (isLargeContentMsg && !additionalClasses.includes('image-counter-message')) {
                    scrollMessageToTop(messageDiv); 
                } else if (!additionalClasses.includes('image-counter-message')) {
                    chatWindowRef.scrollTop = chatWindowRef.scrollHeight; 
                }
            }, 0);
        });
    }
    return messageDiv;
}

export function showLoadingIndicator() {
    const loadingMessage = addMessage('', 'bot');
    if (loadingMessage) {
        loadingMessage.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    }
    return loadingMessage;
}

export function removeLoadingIndicator(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
    }
}

// Modified setUIDisabledState to accept shouldFocusInput parameter
export function setUIDisabledState(disabled, shouldFocusInput = true) {
    if (userInputRef) {
        userInputRef.disabled = disabled;
        userInputRef.style.opacity = disabled ? "0.7" : "1";
    }
    if (sendBtnRef) {
        sendBtnRef.disabled = disabled;
        sendBtnRef.style.cursor = disabled ? "not-allowed" : "pointer";
        sendBtnRef.style.opacity = disabled ? "0.7" : "1";
    }

    if (suggestionBtnsRef) {
        suggestionBtnsRef.forEach(sBtn => {
            if (sBtn.id === 'viewRandomClassBtn' && sBtn.dataset.allShown === 'true') {
                sBtn.disabled = true;
                sBtn.style.opacity = "0.5";
                sBtn.style.cursor = "not-allowed";
            } else {
                sBtn.disabled = disabled;
                sBtn.style.opacity = disabled ? "0.7" : "1";
                sBtn.style.cursor = disabled ? "not-allowed" : "pointer";
            }
        });
    }

    // Only focus if enabling AND shouldFocusInput is true
    if (!disabled && shouldFocusInput && userInputRef) {
        userInputRef.focus();
    }
}

export function renderMarkdown(markdownText, sender = 'bot', mainContext) {
    let htmlContent = markdownText; 
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        htmlContent = marked.parse(markdownText);
    } else {
        console.warn("marked.js not available, rendering raw text with line breaks.");
        htmlContent = markdownText.replace(/\n/g, '<br>');
    }

    addMessage(htmlContent, sender, true); 

    if (sender === 'bot' && mainContext && mainContext.state) {
        mainContext.state.addMessageToHistory('model', markdownText);
    }
}