// Prevent orphaned items in grid layout
document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('info-grid');
    if (!grid) return;
    
    const cards = Array.from(grid.querySelectorAll('.grid-card'));
    const totalCards = cards.length;
    
    function adjustGridLayout() {
        // Reset all flex values first
        cards.forEach(card => {
            if (card.id === 'description') {
                card.style.flex = '2 1 560px';
            } else {
                card.style.flex = '';
            }
        });
        
        // Use ResizeObserver or getBoundingClientRect to check layout
        const containerWidth = grid.getBoundingClientRect().width;
        const gap = 32; // 2rem in pixels
        const minCardWidth = 280;
        const descriptionCard = document.getElementById('description');
        
        // Estimate cards per row (accounting for description taking 2x width)
        let effectiveCards = totalCards;
        if (descriptionCard && containerWidth > 900) {
            // Description takes roughly 2 slots
            effectiveCards = totalCards + 1;
        }
        
        const cardsPerRow = Math.floor((containerWidth + gap) / (minCardWidth + gap));
        
        if (cardsPerRow >= 2 && containerWidth > 600) {
            // Check if last row would have only 1 item
            const rows = Math.ceil(effectiveCards / cardsPerRow);
            const lastRowStart = (rows - 1) * cardsPerRow;
            const lastRowCount = effectiveCards - lastRowStart;
            
            if (lastRowCount === 1 && rows > 1) {
                // Make the last card and previous cards in that row wider
                const cardsInPreviousRow = cardsPerRow;
                const startIndex = Math.max(0, totalCards - cardsInPreviousRow);
                
                for (let i = startIndex; i < totalCards; i++) {
                    if (cards[i] && cards[i].id !== 'description') {
                        const flexBasis = `calc(${100 / cardsInPreviousRow}% - ${gap * (cardsInPreviousRow - 1) / cardsInPreviousRow}px)`;
                        cards[i].style.flex = `1 1 ${flexBasis}`;
                    }
                }
            }
        }
    }
    
    // Adjust on load and resize with debounce
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustGridLayout, 100);
    }
    
    adjustGridLayout();
    window.addEventListener('resize', handleResize);
    
    // Also adjust after a short delay to account for any dynamic content
    setTimeout(adjustGridLayout, 500);
});

