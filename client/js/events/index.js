import { handleUserQueryInput, handleSuggestionButtonClick } from './handlers.js';

export function attachEventListeners(mainContext) {
    const { dom } = mainContext;

    function expand() {
        dom.suggestionsContainer.classList.add('expanded');
        if (dom.columnTitles) dom.columnTitles.setAttribute('aria-expanded', 'true');
    }

    function collapse() {
        dom.suggestionsContainer.classList.remove('expanded');
        if (dom.columnTitles) dom.columnTitles.setAttribute('aria-expanded', 'false');
    }

    function collapseInstant() {
        if (!dom.suggestionsContainer.classList.contains('expanded')) return;
        collapse();
    }

    function toggleMoreSection() {
        if (!dom.suggestionsContainer) return;
        const isExpanded = dom.suggestionsContainer.classList.contains('expanded');
        if (isExpanded) {
            collapse();
        } else {
            expand();
        }
    }

    // 1. Send Button
    if (dom.sendBtn) {
        dom.sendBtn.addEventListener('click', () => {
            if (dom.userInput) {
                handleUserQueryInput(dom.userInput.value, mainContext, true);
                collapseInstant();
            }
        });
    }

    // 2. Text Input (Enter Key)
    if (dom.userInput) {
        dom.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleUserQueryInput(dom.userInput.value, mainContext, true);
                collapseInstant();
            }
        });
    }

    // 3. Column titles row click toggles section
    if (dom.columnTitles) {
        dom.columnTitles.addEventListener('click', (e) => {
            // Don't toggle if clicking a chip inside the container
            if (e.target.closest('.suggestion-btn')) return;
            toggleMoreSection();
        });
        dom.columnTitles.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMoreSection();
            }
        });
    }

    // 4. Suggestion Buttons — event delegation on wrapper
    if (dom.suggestionsWrapper) {
        dom.suggestionsWrapper.addEventListener('click', (e) => {
            const btn = e.target.closest('.suggestion-btn');
            if (!btn) return;

            // Skip external links (let native <a> behavior work)
            if (btn.dataset.type === 'external-link') return;

            // Don't let the click bubble up to the header toggle
            e.stopPropagation();

            handleSuggestionButtonClick(btn, mainContext);

            // Instant collapse after clicking a chip
            collapseInstant();
        });
    }
}
