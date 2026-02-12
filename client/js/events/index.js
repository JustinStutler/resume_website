import { handleUserQueryInput, handleSuggestionButtonClick } from './handlers.js';

export function attachEventListeners(mainContext) {
    const { dom, ui } = mainContext;

    // Helper to collapse suggestions
    const collapseSuggestions = () => {
        if (dom.suggestionsContainer && dom.suggestionsContainer.classList.contains('expanded')) {
            dom.suggestionsContainer.classList.remove('expanded');
            if (dom.suggestionsToggleBtn) {
                dom.suggestionsToggleBtn.classList.remove('open');
                dom.suggestionsToggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    };

    // 1. Send Button
    if (dom.sendBtn) {
        dom.sendBtn.addEventListener('click', () => {
            if (dom.userInput) {
                handleUserQueryInput(dom.userInput.value, mainContext, true);
                collapseSuggestions();
                mainContext.state.isInitialMenuState = false;
            }
        });
    }

    // 2. Text Input (Enter Key)
    if (dom.userInput) {
        dom.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleUserQueryInput(dom.userInput.value, mainContext, true);
                collapseSuggestions();
                mainContext.state.isInitialMenuState = false;
            }
        });
    }

    // 3. Hamburger Menu Toggle
    if (dom.suggestionsToggleBtn && dom.suggestionsContainer) {
        dom.suggestionsToggleBtn.addEventListener('click', () => {
            const isExpanded = dom.suggestionsContainer.classList.contains('expanded');
            dom.suggestionsContainer.classList.toggle('expanded');
            dom.suggestionsToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
            dom.suggestionsToggleBtn.classList.toggle('open', !isExpanded);
            mainContext.state.isInitialMenuState = false;  // Exit initial state on manual toggle
        });
    }

    // 4. Suggestion Buttons
    if (dom.allClickableSuggestionBtns) {
        dom.allClickableSuggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                handleSuggestionButtonClick(btn, mainContext);

                // Auto-collapse menu and exit initial state
                if (btn.id !== 'suggestions-toggle-btn') {
                    collapseSuggestions();
                    mainContext.state.isInitialMenuState = false;
                }
            });
        });
    }

    // 5. Hover-based menu control
    if (dom.suggestionsWrapper && dom.suggestionsContainer && dom.suggestionsToggleBtn) {
        // Expand on hover
        dom.suggestionsWrapper.addEventListener('mouseenter', () => {
            if (!dom.suggestionsContainer.classList.contains('expanded')) {
                dom.suggestionsContainer.classList.add('expanded');
                dom.suggestionsToggleBtn.classList.add('open');
                dom.suggestionsToggleBtn.setAttribute('aria-expanded', 'true');
            }
        });

        // Collapse on leave (only if not in initial state)
        dom.suggestionsWrapper.addEventListener('mouseleave', () => {
            if (!mainContext.state.isInitialMenuState && dom.suggestionsContainer.classList.contains('expanded')) {
                dom.suggestionsContainer.classList.remove('expanded');
                dom.suggestionsToggleBtn.classList.remove('open');
                dom.suggestionsToggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
}