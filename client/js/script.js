// js/script.js
import * as Config from './config.js';
import * as UI from './ui.js';
import *  as API from './api.js';
import * as EventHandlers from './eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
    const domElements = {
        chatWindow: document.getElementById('chat-window'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        // For the new "show more/less" pattern:
        suggestionsAreaWrapper: document.querySelector('.suggestions-area-wrapper'), // The parent
        suggestionsContainer: document.getElementById('suggestions-container'),     // The container that expands/collapses
        suggestionsToggleBtn: document.getElementById('suggestions-toggle-btn'),  // The hamburger/toggle button
        allClickableSuggestionBtns: document.querySelectorAll('.suggestions-container .suggestion-btn'), // ALL buttons
        randomClassBtn: document.getElementById('viewRandomClassBtn') // Still needed if specific logic applies
    };

    // Hamburger icon bars (if you are using <span> for bars)
    // If using SVGs directly, this might not be needed or adjust accordingly
    const hamburgerBars = domElements.suggestionsToggleBtn ? domElements.suggestionsToggleBtn.querySelectorAll('.hamburger-bar') : [];


    UI.initUIElements(domElements);

    let isBotBusyInternal = false;
    const buttonCooldownsMap = new Map();
    let shownCourseIdentifiersArray = [];
    let viewedImageNamesSet = new Set();
    let lastImageShownBeforeReset = null;
    let lastCourseShownBeforeReset = null;
    let chatHistoryArray = [];
    let activeBackendUrl = null;

    const state = {
        get isBotBusy() { return isBotBusyInternal; },
        setBotBusy: (value, shouldFocusAfterReEnable = true) => {
            isBotBusyInternal = value;
            UI.setUIDisabledState(value, !value ? shouldFocusAfterReEnable : false);
        },
        get buttonCooldowns() { return buttonCooldownsMap; },
        get shownCourseIdentifiers() { return shownCourseIdentifiersArray; },
        addShownCourse: (courseId) => shownCourseIdentifiersArray.push(courseId),
        clearShownCourses: () => { shownCourseIdentifiersArray = []; },
        get viewedImageNames() { return viewedImageNamesSet; },
        addViewedImage: (imageName) => viewedImageNamesSet.add(imageName),
        clearViewedImages: () => { viewedImageNamesSet.clear(); },
        get lastImageShown() { return lastImageShownBeforeReset; },
        setLastImageShown: (imageName) => { lastImageShownBeforeReset = imageName; },
        get lastCourseShown() { return lastCourseShownBeforeReset; },
        setLastCourseShown: (course) => { lastCourseShownBeforeReset = course; },
        get chatHistory() { return chatHistoryArray; },
        addMessageToHistory: (role, text) => {
            if (typeof text === 'string') {
                const trimmedText = text.trim();
                if (trimmedText) {
                    chatHistoryArray.push({ role: role, parts: [{ text: trimmedText }] });
                } else {
                    // console.warn(`HISTORY_ADD_SKIP: Attempted to add empty/whitespace text. Role: ${role}`);
                }
            } else {
                // console.warn(`HISTORY_ADD_SKIP: Attempted to add non-string. Role: ${role}`);
            }
        },
        clearChatHistory: () => { chatHistoryArray = []; },
        getActiveBackendUrl: () => activeBackendUrl,
        setActiveBackendUrl: (url) => {
            activeBackendUrl = url;
            if (url) console.log(`Backend URL set to: ${url}`);
        }
    };

    const mainContext = { dom: domElements, state, config: Config, ui: UI, api: API, data: { allDescribableCourses: Config.allDescribableCourses, imageGallery: Config.imageGallery } };
    UI.initAppContext(mainContext);

    // --- Event Listeners ---
    if (domElements.sendBtn) {
        domElements.sendBtn.addEventListener('click', () => {
            if (domElements.userInput) EventHandlers.handleUserQueryInput(domElements.userInput.value, mainContext, true);
        });
    }
    if (domElements.userInput) {
        domElements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                EventHandlers.handleUserQueryInput(domElements.userInput.value, mainContext, true);
            }
        });
    }

    // Suggestions Toggle Logic (Hamburger Menu for "Show More/Less")
    if (domElements.suggestionsToggleBtn && domElements.suggestionsContainer) {
        // Check if SVG icons are used for toggle button state
        const toggleBtnChevronDown = domElements.suggestionsToggleBtn.querySelector('.icon-chevron-down');
        const toggleBtnChevronUp = domElements.suggestionsToggleBtn.querySelector('.icon-chevron-up');
        const toggleBtnTextSpan = domElements.suggestionsToggleBtn.querySelector('.toggle-text');


        domElements.suggestionsToggleBtn.addEventListener('click', () => {
            const isCurrentlyExpanded = domElements.suggestionsContainer.classList.contains('expanded');
            domElements.suggestionsContainer.classList.toggle('expanded');
            domElements.suggestionsToggleBtn.setAttribute('aria-expanded', String(!isCurrentlyExpanded));
            
            // Toggle for hamburger bars to 'X'
            domElements.suggestionsToggleBtn.classList.toggle('open', !isCurrentlyExpanded);

            // Toggle for chevron icons and text, if they exist
            if (toggleBtnChevronDown && toggleBtnChevronUp && toggleBtnTextSpan) {
                if (!isCurrentlyExpanded) { // Means it's now expanded
                    toggleBtnTextSpan.textContent = 'Less';
                    toggleBtnChevronDown.style.display = 'none';
                    toggleBtnChevronUp.style.display = 'inline-block';
                } else { // Means it's now collapsed
                    toggleBtnTextSpan.textContent = 'More';
                    toggleBtnChevronDown.style.display = 'inline-block';
                    toggleBtnChevronUp.style.display = 'none';
                }
            }
        });
    }

    // Add event listeners to ALL suggestion buttons
    if (domElements.allClickableSuggestionBtns) {
        domElements.allClickableSuggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                EventHandlers.handleSuggestionButtonClick(btn, mainContext);
                // If the container is expanded (mobile view) and a suggestion button (not the toggle itself) is clicked,
                // collapse the suggestions.
                if (domElements.suggestionsContainer && domElements.suggestionsContainer.classList.contains('expanded')) {
                    if (btn.id !== 'suggestions-toggle-btn') { 
                        domElements.suggestionsContainer.classList.remove('expanded');
                        domElements.suggestionsToggleBtn.setAttribute('aria-expanded', 'false');
                        domElements.suggestionsToggleBtn.classList.remove('open'); // Revert hamburger icon

                        // Revert chevron/text if used
                        const toggleBtnChevronDown = domElements.suggestionsToggleBtn.querySelector('.icon-chevron-down');
                        const toggleBtnChevronUp = domElements.suggestionsToggleBtn.querySelector('.icon-chevron-up');
                        const toggleBtnTextSpan = domElements.suggestionsToggleBtn.querySelector('.toggle-text');
                        if (toggleBtnChevronDown && toggleBtnChevronUp && toggleBtnTextSpan) {
                            toggleBtnTextSpan.textContent = 'More';
                            toggleBtnChevronDown.style.display = 'inline-block';
                            toggleBtnChevronUp.style.display = 'none';
                        }
                    }
                }
            });
        });
    }
    
    // Initial UI state: enabled, but input not focused
    UI.setUIDisabledState(false, false); 
    
    setTimeout(() => {
        const initialGreetingText = "Hello! I'm an AI assistant for Justin's portfolio. You can ask me questions, or try one of the suggestions below.";
        UI.addMessage(initialGreetingText, 'bot');
        state.addMessageToHistory('model', initialGreetingText);
        // No initial focus on userInput
    }, 300);
});