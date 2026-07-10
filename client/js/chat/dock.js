// js/chat/dock.js
// Bottom-docked AI chat. The input bar is always visible; the message panel
// collapses by default and opens on send/focus. Reuses the existing api.js
// (backend fallback + warm-up) and ui.js (rendering) modules.

import * as UI from '../ui.js';
import * as API from '../api.js';
import * as Config from '../config.js';

const GREETING = "Hi! I'm Justin's portfolio AI. Ask me anything about his projects, " +
    "skills, education, or experience — or browse the wiki above.";

export function initDock() {
    const dock = document.getElementById('chat-dock');
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const toggle = document.getElementById('chat-dock-toggle');
    const closeBtn = document.getElementById('chat-dock-close');
    if (!dock || !chatWindow || !userInput || !sendBtn) return;

    UI.initUIElements({ chatWindow, userInput, sendBtn, suggestionBtns: null });

    let botBusy = false;
    let activeBackendUrl = null;
    const chatHistory = [];

    const state = {
        get isBotBusy() { return botBusy; },
        setBotBusy: (value, shouldFocus = true) => {
            botBusy = value;
            UI.setUIDisabledState(value, !value ? shouldFocus : false);
        },
        chatHistory,
        addMessageToHistory: (role, text) => {
            if (typeof text === 'string' && text.trim()) {
                chatHistory.push({ role, parts: [{ text: text.trim() }] });
            }
        },
        getActiveBackendUrl: () => activeBackendUrl,
        setActiveBackendUrl: (url) => { activeBackendUrl = url; },
        hideWarmupNotice: () => {}
    };

    const ctx = { dom: { chatWindow, userInput, sendBtn }, state, config: Config, ui: UI, api: API };
    UI.initAppContext(ctx);

    const open = () => { dock.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); };
    const close = () => { dock.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };

    let greeted = false;
    const ensureGreeting = () => {
        if (greeted) return;
        greeted = true;
        UI.addMessage(GREETING, 'bot');
        chatHistory.push({ role: 'model', parts: [{ text: GREETING }] });
    };

    const send = () => {
        const q = userInput.value.trim();
        if (!q || botBusy) return;
        open();
        ensureGreeting();
        UI.addMessage(q, 'user');
        state.addMessageToHistory('user', q);
        userInput.value = '';
        API.callJustinAI(q, (resp) => UI.renderMarkdown(resp, 'bot', ctx), null, ctx, true);
    };

    toggle.addEventListener('click', () => {
        if (dock.classList.contains('open')) { close(); }
        else { open(); ensureGreeting(); }
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    sendBtn.addEventListener('click', send);
    userInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); send(); }
    });
    userInput.addEventListener('focus', () => { open(); ensureGreeting(); });
}
