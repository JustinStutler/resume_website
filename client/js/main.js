import * as Config from './config.js';
import * as UI from './ui.js';
import * as API from './api.js';
import { attachEventListeners } from './events/index.js';
import { CourseManager } from './services/courseManager.js';
import { GalleryManager } from './services/galleryManager.js';
import { DocumentManager } from './services/documentManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements Cache
    const domElements = {
        chatWindow: document.getElementById('chat-window'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        suggestionsContainer: document.getElementById('suggestions-container'),
        suggestionsWrapper: document.querySelector('.suggestions-area-wrapper'),
        suggestionsHeader: document.querySelector('.suggestions-header'),
        suggestionsToggleBtn: document.getElementById('suggestions-toggle-btn'),
        allClickableSuggestionBtns: document.querySelectorAll('.suggestions-container .suggestion-btn'),
        randomClassBtn: document.getElementById('viewRandomClassBtn')
    };

    // 2. Initialize UI
    UI.initUIElements(domElements);

    // 3. State Management
    let isBotBusyInternal = false;
    let chatHistoryArray = [];
    let activeBackendUrl = null;

    const state = {
        get isBotBusy() { return isBotBusyInternal; },
        setBotBusy: (value, shouldFocus = true) => {
            isBotBusyInternal = value;
            UI.setUIDisabledState(value, !value ? shouldFocus : false);
        },
        buttonCooldowns: new Map(),
        chatHistory: chatHistoryArray,
        addMessageToHistory: (role, text) => {
            if (typeof text === 'string' && text.trim()) {
                chatHistoryArray.push({ role, parts: [{ text: text.trim() }] });
            }
        },
        getActiveBackendUrl: () => activeBackendUrl,
        setActiveBackendUrl: (url) => activeBackendUrl = url,
        isInitialMenuState: true  // Track if menu is in initial state (stays open until first interaction)
    };

    // 4. Initialize Logic Services
    const services = {
        courseManager: new CourseManager(),
        galleryManager: new GalleryManager(),
        documentManager: new DocumentManager()
    };

    // 5. Build Context
    const mainContext = {
        dom: domElements,
        state,
        config: Config,
        ui: UI,
        api: API,
        services
    };

    UI.initAppContext(mainContext);

    // 6. Attach Events
    attachEventListeners(mainContext);

    // 7. Startup
    UI.setUIDisabledState(false, false);
    setTimeout(() => {
        const initialText = "Hello! I'm an AI assistant for Justin's portfolio. You can ask me questions, or try one of the suggestions below.";
        UI.addMessage(initialText, 'bot');
        state.addMessageToHistory('model', initialText);
    }, 300);

    // 8. Mobile Behavior Setup
    const setupMobileBehavior = () => {
        const { suggestionsContainer, suggestionsToggleBtn, allClickableSuggestionBtns } = domElements;
        if (!suggestionsContainer || !suggestionsToggleBtn) return;

        // Initial Expansion (per user request)
        suggestionsContainer.classList.add('expanded');
        suggestionsToggleBtn.classList.add('open');
        suggestionsToggleBtn.setAttribute('aria-expanded', 'true');

        // Resize Logic
        let wasSmall = window.innerWidth <= 900;

        window.addEventListener('resize', () => {
            const isSmall = window.innerWidth <= 900;

            // Auto-collapse only when transitioning from Desktop to Mobile
            if (!wasSmall && isSmall) {
                suggestionsContainer.classList.remove('expanded');
                suggestionsToggleBtn.classList.remove('open');
                suggestionsToggleBtn.setAttribute('aria-expanded', 'false');
            }
            wasSmall = isSmall;

            // Re-run sort on resize in case widths change (optional but good for robustness)
            runPyramidSort();
        });

        // Pyramid Sort Logic
        const runPyramidSort = () => {
            if (!allClickableSuggestionBtns) return;

            // Helper to sort buttons by width (Shortest Top -> Longest Bottom)
            const assignOrder = (buttons, cssVar) => {
                const btnData = buttons.map((btn, index) => {
                    let width = btn.offsetWidth;
                    if (width === 0) width = btn.textContent.trim().length * 10;
                    return { btn, width, index };
                });

                btnData.sort((a, b) => {
                    if (Math.abs(a.width - b.width) < 2) return a.index - b.index;
                    return a.width - b.width;
                });

                btnData.forEach((item, sortedIndex) => {
                    item.btn.style.setProperty(cssVar, sortedIndex);
                });
            };

            // 1. Mobile Sort (Global)
            const allBtns = Array.from(allClickableSuggestionBtns);
            assignOrder(allBtns, '--mobile-order');

            // 2. Desktop Sort (Per Column)
            const columns = document.querySelectorAll('.suggestion-column');
            columns.forEach(col => {
                const colBtns = Array.from(col.querySelectorAll('.suggestion-btn'));
                if (colBtns.length > 0) {
                    assignOrder(colBtns, '--desktop-order');
                }
            });
        };

        // Run sort on load (wait for layout)
        window.addEventListener('load', runPyramidSort);
        // Also run immediately in case we are already loaded
        requestAnimationFrame(runPyramidSort);
    };

    setupMobileBehavior();
});