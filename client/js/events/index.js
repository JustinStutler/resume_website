import { handleUserQueryInput, handleSuggestionButtonClick } from './handlers.js';

export function attachEventListeners(mainContext) {
    const { dom, ui } = mainContext;

    // 1. Send Button
    if (dom.sendBtn) {
        dom.sendBtn.addEventListener('click', () => {
            if (dom.userInput) handleUserQueryInput(dom.userInput.value, mainContext, true);
        });
    }

    // 2. Text Input (Enter Key)
    if (dom.userInput) {
        dom.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleUserQueryInput(dom.userInput.value, mainContext, true);
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
        });
    }

    // 4. Suggestion Buttons
    if (dom.allClickableSuggestionBtns) {
        dom.allClickableSuggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                handleSuggestionButtonClick(btn, mainContext);
                
                // Auto-collapse menu on mobile
                if (dom.suggestionsContainer && dom.suggestionsContainer.classList.contains('expanded')) {
                    if (btn.id !== 'suggestions-toggle-btn') { 
                        dom.suggestionsContainer.classList.remove('expanded');
                        dom.suggestionsToggleBtn.classList.remove('open');
                    }
                }
            });
        });
    }
}