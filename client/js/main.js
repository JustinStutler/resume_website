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
        chatContainer: document.getElementById('chat-container'),
        aiLogo: document.getElementById('ai-logo'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        suggestionsContainer: document.getElementById('suggestions-container'),
        suggestionsWrapper: document.querySelector('.suggestions-area-wrapper'),
        allClickableSuggestionBtns: document.querySelectorAll('.suggestions-container .suggestion-btn'),
        randomClassBtn: document.getElementById('viewRandomClassBtn'),
        greeting: document.querySelector('.greeting'),
        columnTitles: document.getElementById('column-titles'),
        warmupNotice: null  // created dynamically in chat
    };

    // 2. Initialize UI
    UI.initUIElements(domElements);

    // 3. State Management
    let isBotBusyInternal = false;
    let chatHistoryArray = [];
    let activeBackendUrl = null;
    let queuedAction = null;

    const state = {
        get isBotBusy() { return isBotBusyInternal; },
        setBotBusy: (value, shouldFocus = true) => {
            isBotBusyInternal = value;
            UI.setUIDisabledState(value, !value ? shouldFocus : false);
            // Logo spin/color control
            const logo = domElements.aiLogo;
            if (logo) {
                if (value) {
                    logo.classList.remove('done');
                    logo.classList.add('processing');
                } else {
                    logo.classList.remove('processing');
                    logo.classList.add('done');
                }
            }

            // If we just finished (busy -> not busy), check for queued actions
            if (value === false && queuedAction) {
                const action = queuedAction;
                queuedAction = null;
                // Execute in next frame to ensure UI has updated
                requestAnimationFrame(() => action());
            }
        },
        get queuedAction() { return queuedAction; },
        set queuedAction(val) { queuedAction = val; },
        buttonCooldowns: new Map(),
        chatHistory: chatHistoryArray,
        addMessageToHistory: (role, text) => {
            if (typeof text === 'string' && text.trim()) {
                chatHistoryArray.push({ role, parts: [{ text: text.trim() }] });
            }
        },
        getActiveBackendUrl: () => activeBackendUrl,
        setActiveBackendUrl: (url) => activeBackendUrl = url
    };

    // 4. Initialize Logic Services
    const services = {
        courseManager: new CourseManager(),
        galleryManager: new GalleryManager(),
        documentManager: new DocumentManager()
    };

    DocumentManager.initDownloadHandler();
    DocumentManager.initTabHandler();

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

    // 6b. Landing → Active transition + compact greeting
    let hasLeftLanding = false;
    const leaveLandingState = () => {
        if (hasLeftLanding) return;
        hasLeftLanding = true;
        const container = domElements.chatContainer;
        if (container && container.classList.contains('landing')) {
            container.classList.remove('landing');
            container.classList.add('chat-expanding');
            // Remove expanding class after animation completes
            container.addEventListener('animationend', () => {
                container.classList.remove('chat-expanding');
            }, { once: true });
        }
    };

    const compactGreeting = () => {
        if (domElements.greeting && !domElements.greeting.classList.contains('compact')) {
            domElements.greeting.classList.add('compact');
        }
    };
    // Hook into any user message to trigger landing exit + compact
    const originalAddMessage = state.addMessageToHistory;
    state.addMessageToHistory = (role, text) => {
        if (role === 'user') {
            leaveLandingState();
            compactGreeting();
        }
        originalAddMessage(role, text);
    };

    // 6d. Hide warm-up notice after first AI query completes
    state.hideWarmupNotice = () => {
        if (domElements.warmupNotice) {
            domElements.warmupNotice.classList.add('hidden');
        }
    };

    // 7. Startup
    UI.setUIDisabledState(false, false);

    // Show welcome message immediately so it's the first message in every chat
    const initialText = "Hey there! I'm Justin's portfolio AI — ask me anything about his projects, skills, experience, or education. You can also try the suggestions below.";
    UI.addMessage(initialText, 'bot');
    chatHistoryArray.push({ role: 'model', parts: [{ text: initialText }] });

    // Inject warm-up notice into the chat window
    const warmupEl = document.createElement('div');
    warmupEl.className = 'warmup-notice-chat';
    warmupEl.id = 'warmup-notice';
    warmupEl.textContent = 'First query may take ~1 minute while the Gemini server warms up';
    domElements.chatWindow.appendChild(warmupEl);
    domElements.warmupNotice = warmupEl;

    // 8. Mobile Behavior Setup
    const setupMobileBehavior = () => {
        const { suggestionsContainer, columnTitles, allClickableSuggestionBtns } = domElements;
        if (!suggestionsContainer) return;

        // Re-run sort on resize in case widths change
        window.addEventListener('resize', () => {
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