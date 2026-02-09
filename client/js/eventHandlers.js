// js/eventHandlers.js

// Added `shouldFocusAfterCompletion` parameter
export function handleUserQueryInput(queryText, mainContext, shouldFocusAfterCompletion = false) {
    const { state, ui, api, dom } = mainContext;
    const trimmedQuery = queryText.trim();

    if (state.isBotBusy && (trimmedQuery !== '' || queryText.startsWith('Suggestion:'))) {
        if (!queryText.startsWith('Suggestion:')) {
             console.log("Bot is busy, user query ignored.");
             return;
        }
    }
    if (!trimmedQuery) {
        // If input is empty, and it was a direct submission, maybe focus back?
        // For now, just return. If user submitted empty, they might not want focus.
        return;
    }

    ui.addMessage(trimmedQuery, 'user'); 
    state.addMessageToHistory('user', trimmedQuery);

    if (dom.userInput) dom.userInput.value = '';

    const isGreQuery = /\bgre\b/i.test(trimmedQuery);

    if (isGreQuery) {
        state.setBotBusy(true, false); // Disable UI, don't plan to focus yet
        const loadingElement = ui.showLoadingIndicator();
        const greFilePath = 'pdfs/GRE_Scores_Formatted.md';

        fetch(greFilePath)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} fetching ${greFilePath}`);
                return response.text();
            })
            .then(text => {
                ui.removeLoadingIndicator(loadingElement);
                ui.renderMarkdown(text, 'bot', mainContext); 
            })
            .catch(error => {
                ui.removeLoadingIndicator(loadingElement);
                console.error(`Error fetching local GRE scores file (${greFilePath}):`, error);
                const msg = "Sorry, I couldn't retrieve the GRE scores information at the moment.";
                ui.addMessage(msg, 'bot');
                state.addMessageToHistory('model', msg);
            })
            .finally(() => {
                // For direct user input of GRE query, use shouldFocusAfterCompletion
                state.setBotBusy(false, shouldFocusAfterCompletion);
            });
    } else {
        // Pass shouldFocusAfterCompletion to callJustinAI
        // callJustinAI's finally block will use this to decide on focusing
        api.callJustinAI(trimmedQuery, (response) => {
            ui.renderMarkdown(response, 'bot', mainContext);
        }, null, mainContext, shouldFocusAfterCompletion);
    }
}

function handleRandomClassSuggestion(btn, mainContext) {
    const { state, ui, data, dom } = mainContext;
    const userMessageText = btn.dataset.userDisplayMessage || "Tell me about a class Justin has taken.";
    ui.addMessage(userMessageText, 'user'); 
    state.addMessageToHistory('user', userMessageText);

    let availableCourses = data.allDescribableCourses.filter(course =>
        !state.shownCourseIdentifiers.includes(JSON.stringify({ name: course.name, institution: course.institution, term: course.term }))
    );
    
    let courseToDisplay;

    if (availableCourses.length === 0) {
        const resetMessage = "You've heard about all of Justin's university and AP courses! The list has been reset. Click the button again to start over.";
        ui.addMessage(resetMessage, 'bot'); 
        state.addMessageToHistory('model', resetMessage);
        
        state.clearShownCourses();
        availableCourses = [...data.allDescribableCourses];

        if (state.lastCourseShown && availableCourses.length > 1) {
            const lastCourseIdentifier = JSON.stringify({
                name: state.lastCourseShown.name,
                institution: state.lastCourseShown.institution,
                term: state.lastCourseShown.term
            });
            const tempPickable = availableCourses.filter(c =>
                JSON.stringify({ name: c.name, institution: c.institution, term: c.term }) !== lastCourseIdentifier
            );
            if (tempPickable.length > 0) {
                availableCourses = tempPickable;
            }
        }
        
        if (dom.randomClassBtn) {
            dom.randomClassBtn.textContent = "Tell me about a class Justin has taken";
            dom.randomClassBtn.disabled = false;
            dom.randomClassBtn.dataset.allShown = 'false';
            dom.randomClassBtn.style.opacity = "1";
            dom.randomClassBtn.style.cursor = "pointer";
        }
        state.buttonCooldowns.delete(btn); // Clear cooldown since action completed
        // Ensure UI is enabled but DONT focus for button click
        if (!state.isBotBusy) ui.setUIDisabledState(false, false); 
        return; 
    }

    const randomIndex = Math.floor(Math.random() * availableCourses.length);
    courseToDisplay = availableCourses[randomIndex];

    const markdownOutput = `**Course:** ${courseToDisplay.name}\n\n**Institution:** ${courseToDisplay.institution} - ${courseToDisplay.term}\n\n**Description:** ${courseToDisplay.description}`;
    ui.renderMarkdown(markdownOutput, 'bot', mainContext); 

    const courseIdentifier = JSON.stringify({
        name: courseToDisplay.name,
        institution: courseToDisplay.institution,
        term: courseToDisplay.term
    });
    state.addShownCourse(courseIdentifier);
    state.setLastCourseShown(courseToDisplay); 

    if (state.shownCourseIdentifiers.length >= data.allDescribableCourses.length) {
        if (dom.randomClassBtn) {
            dom.randomClassBtn.textContent = "All Classes Shown";
            dom.randomClassBtn.disabled = true;
            dom.randomClassBtn.dataset.allShown = 'true';
            dom.randomClassBtn.style.opacity = "0.5";
            dom.randomClassBtn.style.cursor = "not-allowed";
        }
    }
    // Ensure UI is enabled but DONT focus for button click
    if (!state.isBotBusy) ui.setUIDisabledState(false, false);
}


function handlePdfSuggestion(btn, mainContext) {
    const { ui, config, state } = mainContext; 
    const userMessageText = btn.dataset.userDisplayMessage || btn.textContent.trim();
    ui.addMessage(userMessageText, 'user'); 
    state.addMessageToHistory('user', userMessageText);

    const pdfType = btn.dataset.pdf;
    let friendlyName, pdfPath, imagePath, downloadFileName;

    if (pdfType === 'resume') {
        friendlyName = "Justin's Resume";
        pdfPath = 'pdfs/Resume - Justin Stutler.pdf';
        imagePath = 'pdfs/Resume - Justin Stutler.png';
        downloadFileName = 'Resume - Justin Stutler.pdf';
    } else if (pdfType === 'sop') {
        friendlyName = "Justin's Statement of Purpose";
        pdfPath = 'pdfs/Statement of Purpose - Justin Stutler.pdf';
        imagePath = 'pdfs/Statement of Purpose - Justin Stutler.png';
        downloadFileName = 'Statement of Purpose - Justin Stutler.pdf';
    } else {
        console.error("Unknown PDF type:", pdfType);
        const errorMessage = "Sorry, I couldn't find that document.";
        ui.addMessage(errorMessage, 'bot'); 
        state.addMessageToHistory('model', errorMessage); 
        if (!state.isBotBusy) ui.setUIDisabledState(false, false); // Re-enable if no bot activity
        return;
    }
    const responseHtml = `
        <div class="document-preview-container">
            <div class="preview-header">
                <p>Here's a preview of ${friendlyName}:</p>
                <a href="${pdfPath}" download="${downloadFileName}" class="icon-download-button-header" title="Download ${friendlyName}">${config.DOWNLOAD_ICON_SVG}</a>
            </div>
            <div class="image-wrapper">
                <img src="${imagePath}" alt="${friendlyName} Preview" class="document-image-preview" onerror="this.alt='Preview image not available'; this.style.display='none'; this.parentNode.insertAdjacentHTML('beforeend', '<p>Preview image not available.</p>');">
            </div>
        </div>`;
    ui.addMessage(responseHtml, 'bot', true, true);
    state.addMessageToHistory('model', `Displayed ${friendlyName}.`);
    // Ensure UI is enabled but DONT focus for button click
    if (!state.isBotBusy) ui.setUIDisabledState(false, false);
}

function handleLocalMarkdownSuggestion(btn, mainContext) {
    const { state, ui } = mainContext;
    const userMessageText = btn.dataset.userDisplayMessage || btn.textContent.trim();
    ui.addMessage(userMessageText, 'user'); 
    state.addMessageToHistory('user', userMessageText);

    const localFilePath = btn.dataset.localFile;
    
    state.setBotBusy(true, false); // Disable UI, don't focus yet
    const loadingElement = ui.showLoadingIndicator();

    fetch(localFilePath)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} fetching ${localFilePath}`);
            return response.text();
        })
        .then(text => {
            ui.removeLoadingIndicator(loadingElement);
            ui.renderMarkdown(text, 'bot', mainContext); 
        })
        .catch(error => {
            ui.removeLoadingIndicator(loadingElement);
            console.error(`Error fetching local Markdown file (${localFilePath}):`, error);
            const errorMessage = "Sorry, I couldn't retrieve that information.";
            ui.addMessage(errorMessage, 'bot'); 
            state.addMessageToHistory('model', errorMessage); 
        })
        .finally(() => {
            // For button initiated local markdown, DO NOT focus after completion
            state.setBotBusy(false, false); 
        });
}

function handleRandomImageSuggestion(btn, mainContext) {
    const { state, ui, data, dom } = mainContext;
    const userMessageText = btn.dataset.userDisplayMessage || btn.textContent.trim();
    ui.addMessage(userMessageText, 'user'); 
    state.addMessageToHistory('user', userMessageText);

    if (data.imageGallery.length === 0) {
        const noImageMsg = "Sorry, there are no images in the gallery to display.";
        ui.addMessage(noImageMsg, 'bot'); 
        state.addMessageToHistory('model', noImageMsg); 
        if (!state.isBotBusy) ui.setUIDisabledState(false, false);
        return;
    }

    let availableImagesForThisPick = data.imageGallery.filter(imageName => !state.viewedImageNames.has(imageName));
    
    if (availableImagesForThisPick.length === 0 && data.imageGallery.length > 0) {
        const resetMsg = "You've seen all the available images! The image viewer has been reset.";
        ui.addMessage(resetMsg, 'bot'); 
        state.addMessageToHistory('model', resetMsg); 

        const lastImageNameBeforeReset = state.lastImageShown;
        state.clearViewedImages();
        availableImagesForThisPick = [...data.imageGallery];

        if (lastImageNameBeforeReset && availableImagesForThisPick.length > 1) {
            const tempPickable = availableImagesForThisPick.filter(img => img !== lastImageNameBeforeReset);
            if (tempPickable.length > 0) {
                availableImagesForThisPick = tempPickable;
            }
        }
        state.setLastImageShown(null); 
        if (!state.isBotBusy) ui.setUIDisabledState(false, false);
        return; 
    }
    
    const randomIndex = Math.floor(Math.random() * availableImagesForThisPick.length);
    const imageToDisplay = availableImagesForThisPick[randomIndex];

    state.addViewedImage(imageToDisplay);
    state.setLastImageShown(imageToDisplay);

    const imagePath = `images/${imageToDisplay}`;
    const imageId = `randomImage_${Date.now()}`;
    
    const imageDisplayHtml = `
        <div class="random-image-display-container">
            <img id="${imageId}" 
                 src="${imagePath}"
                 alt="Random image: ${imageToDisplay}"
                 class="random-image-content"
                 onerror="this.alt='Image not available: ${imageToDisplay}'; this.style.display='none'; this.parentNode.innerHTML = '<p style=\\'text-align:center; padding: 10px; color: #d0d0d0;\\'>Image not available.</p>';">
        </div>`;
    
    const currentImageMessageElement = ui.addMessage(imageDisplayHtml, 'bot', true, true, ['message-contains-random-image']);
    state.addMessageToHistory('model', `Displayed image: ${imageToDisplay}`);

    const imgTagElement = document.getElementById(imageId);

    if (imgTagElement) {
        imgTagElement.onload = function() {
            if (currentImageMessageElement) {
                ui.scrollImageMessageIntoView(currentImageMessageElement, imgTagElement);
            } else {
                if (dom && dom.chatWindow) dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
            }
        };
        imgTagElement.onerror = function() {
            if (currentImageMessageElement) {
                ui.scrollImageMessageIntoView(currentImageMessageElement, null); 
            } else {
                 if (dom && dom.chatWindow) dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
            }
        };
    } else {
        if (dom && dom.chatWindow) dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
    }

    let counterMessageText = `${state.viewedImageNames.size}/${data.imageGallery.length}`;
    if (state.viewedImageNames.size === data.imageGallery.length) {
        counterMessageText += " - resetting carousel";
    }
    ui.addMessage(counterMessageText, 'bot', false, false, ['image-counter-message']); 
    // Ensure UI is enabled but DONT focus for button click
    if (!state.isBotBusy) ui.setUIDisabledState(false, false);
}

function handleGenericAiQuerySuggestion(btn, mainContext) {
    const { ui, api, state } = mainContext; 
    const userMessageText = btn.dataset.userDisplayMessage || btn.textContent.trim();
    
    if (!userMessageText) {
        console.warn("Attempted to send an empty AI query from a suggestion button.", btn);
        return; 
    }
    ui.addMessage(userMessageText, 'user'); 
    state.addMessageToHistory('user', userMessageText);
    
    let queryToSend = btn.dataset.aiSpecificQuery ? btn.dataset.aiSpecificQuery.replace('{EXCLUDE_PART}', '') : (btn.dataset.query || userMessageText);
    queryToSend = queryToSend.trim(); 

    if (!queryToSend) {
        console.error("Resulting queryToSend is empty for AI suggestion button.", btn);
        return;
    }
    
    // For AI queries via buttons, explicitly pass false for shouldFocusAfterCompletion
    api.callJustinAI(queryToSend, (response) => {
        ui.renderMarkdown(response, 'bot', mainContext); 
    }, btn, mainContext, false); // Pass false here
}


export function handleSuggestionButtonClick(btn, mainContext) {
    const { state, ui, config, dom } = mainContext;
    const type = btn.dataset.type;
    const id = btn.id;

    const isTrueBackendAiInteraction = type === 'ai-query';

    if (state.isBotBusy && isTrueBackendAiInteraction) {
        console.log("Bot is busy with AI. Please wait.");
        return;
    }
    if (state.buttonCooldowns.has(btn) && !btn.disabled) {
         console.log("Button is on cooldown.");
         return;
    }
    if (btn.disabled) {
        return;
    }

    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
    const timeoutId = setTimeout(() => {
        state.buttonCooldowns.delete(btn);
        // Re-enable button visuals if not globally disabled by bot or 'allShown'
        if (!btn.disabled && btn.dataset.allShown !== 'true' && !(state.isBotBusy && isTrueBackendAiInteraction)) {
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
        }
        // No automatic focus attempt here; individual handlers decide or rely on setBotBusy's shouldFocus.
    }, config.BUTTON_COOLDOWN_MS);
    state.buttonCooldowns.set(btn, timeoutId);
    
    if (id === 'viewRandomClassBtn') {
        handleRandomClassSuggestion(btn, mainContext);
    } else if (type === 'pdf') {
        handlePdfSuggestion(btn, mainContext);
    } else if (type === 'local-markdown') {
         handleLocalMarkdownSuggestion(btn, mainContext); // This will call setBotBusy(false, false)
    } else if (type === 'random-image') {
        handleRandomImageSuggestion(btn, mainContext);
    } else if (type === 'ai-query') { 
        handleGenericAiQuerySuggestion(btn, mainContext); // This will call callJustinAI with shouldFocus=false
    } else {
        const queryFromButton = btn.dataset.query;
        if (queryFromButton && queryFromButton.trim() && type !== 'ai-query-random-class') {
            // Treat other data-query buttons as initiating a query that should NOT refocus input
            handleUserQueryInput(queryFromButton, mainContext, false); 
        } else if (type !== 'ai-query-random-class') {
            console.warn("Unknown or unhandled suggestion button type, or empty query:", type, "ID:", id, btn.dataset);
            if (!state.isBotBusy) ui.setUIDisabledState(false, false); // Ensure UI enabled, no focus
        }
    }
}