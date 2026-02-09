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
        setActiveBackendUrl: (url) => activeBackendUrl = url
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
});