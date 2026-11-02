/**
 * Evidence Section - Interactive Card Shuffle & Synchronized Scroll Controller
 * - Left side: 5 interactive heading points with custom radio targets
 * - Dynamic connected callout tooltip with SVG line tracking
 * - Right side: 3D translucent glass cards deck with smooth physics-based shuffle
 * - Bi-directional: Scrolling shuffles cards & updates points; clicking points shuffles cards & updates scroll!
 * - Touch swipe support on mobile devices
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.evidence-section');
    const scrollTrack = document.getElementById('evidenceScrollTrack');
    const pointItems = Array.from(document.querySelectorAll('.evidence-point-item'));
    const cards = Array.from(document.querySelectorAll('.evidence-card'));
    const deckElement = document.getElementById('evidenceCardsDeck');
    const calloutWrap = document.getElementById('evidenceCalloutWrap');
    const calloutText = document.getElementById('evidenceCalloutText');

    if (!section || !scrollTrack || pointItems.length === 0 || cards.length === 0) {
      return;
    }

    const totalSteps = pointItems.length;
    let currentIndex = 0;
    let isManualScrolling = false;
    let scrollTimeout = null;

    // Deck fan configurations for ranks 0 (front) through 4 (back)
    const deckTransforms = [
      { x: 0, y: 0, rot: 0, scale: 1.0, opacity: 1.0, z: 10 },
      { x: 22, y: -8, rot: 5.2, scale: 0.97, opacity: 0.72, z: 9 },
      { x: -20, y: -15, rot: -4.5, scale: 0.94, opacity: 0.52, z: 8 },
      { x: 30, y: -22, rot: 8.0, scale: 0.91, opacity: 0.32, z: 7 },
      { x: -28, y: -28, rot: -7.5, scale: 0.88, opacity: 0.16, z: 6 }
    ];

    /**
     * Apply 3D Card Deck layout based on current active card index
     */
    function updateCardDeck(activeIdx, previousIdx) {
      cards.forEach((card, i) => {
        // Calculate relative depth/rank in the circular deck (0 = top, 4 = bottom)
        const rank = (i - activeIdx + totalSteps) % totalSteps;
        const config = deckTransforms[rank] || deckTransforms[deckTransforms.length - 1];

        // If this was the card just discarded from the top, add brief shuffle-out flair
        if (previousIdx !== undefined && i === previousIdx && rank === totalSteps - 1) {
          card.classList.add('shuffling-out');
          setTimeout(() => {
            card.classList.remove('shuffling-out');
            card.style.transform = `translate3d(${config.x}px, ${config.y}px, 0) rotate(${config.rot}deg) scale(${config.scale})`;
            card.style.opacity = config.opacity;
            card.style.zIndex = config.z;
          }, 320);
        } else {
          card.classList.remove('shuffling-out');
          card.style.transform = `translate3d(${config.x}px, ${config.y}px, 0) rotate(${config.rot}deg) scale(${config.scale})`;
          card.style.opacity = config.opacity;
          card.style.zIndex = config.z;
        }

        card.setAttribute('aria-hidden', rank === 0 ? 'false' : 'true');
      });
    }

    /**
     * Update callout tooltip position & text to align with active point item
     */
    function updateCallout(activeIdx) {
      const activeItem = pointItems[activeIdx];
      if (!activeItem || !calloutWrap || !calloutText) return;

      const calloutMessage = activeItem.getAttribute('data-callout') || '';

      // Fade out, change text, fade in
      calloutText.style.opacity = '0';
      calloutText.style.transform = 'translateY(4px)';

      setTimeout(() => {
        calloutText.textContent = calloutMessage;
        calloutText.style.opacity = '1';
        calloutText.style.transform = 'translateY(0)';
      }, 150);

      // Align vertical offset of callout box to active item
      const itemTop = activeItem.offsetTop;
      calloutWrap.style.transform = `translateY(${itemTop}px)`;
    }

    /**
     * Activate a given index (0 to 4)
     */
    function setActiveStep(newIndex, updateScroll = false) {
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= totalSteps) newIndex = totalSteps - 1;

      const prevIndex = currentIndex;
      currentIndex = newIndex;

      // 1. Update left points list highlight
      pointItems.forEach((item, idx) => {
        if (idx === currentIndex) {
          item.classList.add('active');
          item.setAttribute('aria-selected', 'true');
        } else {
          item.classList.remove('active');
          item.setAttribute('aria-selected', 'false');
        }
      });

      // 2. Update connected callout tooltip
      updateCallout(currentIndex);

      // 3. Shuffle card deck
      updateCardDeck(currentIndex, prevIndex);

      // 4. If triggered by click, scroll into corresponding track position
      if (updateScroll && window.innerWidth > 992) {
        isManualScrolling = true;
        clearTimeout(scrollTimeout);

        const trackRect = scrollTrack.getBoundingClientRect();
        const absoluteTrackTop = window.pageYOffset + trackRect.top;
        const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;

        const targetY = absoluteTrackTop + (currentIndex / (totalSteps - 1)) * scrollDistance;

        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });

        scrollTimeout = setTimeout(() => {
          isManualScrolling = false;
        }, 800);
      }
    }

    /**
     * Scroll handler for desktop pinned sticky progression
     */
    function handleScroll() {
      if (isManualScrolling || window.innerWidth <= 992) return;

      const rect = scrollTrack.getBoundingClientRect();
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;

      if (scrollDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));

      // Map progress 0.0 -> 1.0 into step 0 -> 4
      const calculatedIndex = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

      if (calculatedIndex !== currentIndex) {
        setActiveStep(calculatedIndex, false);
      }
    }

    // Attach click listeners to point items
    pointItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        setActiveStep(index, true);
      });
    });

    // Attach click listeners to cards so clicking a peeking card shuffles it to front
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        setActiveStep(index, true);
      });
    });

    // Mobile swipe gesture support
    if (deckElement) {
      let touchStartX = 0;
      let touchStartY = 0;

      deckElement.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }
      }, { passive: true });

      deckElement.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const diffX = e.changedTouches[0].screenX - touchStartX;
          const diffY = e.changedTouches[0].screenY - touchStartY;

          if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) {
              // Swiped left -> next card
              setActiveStep((currentIndex + 1) % totalSteps, true);
            } else {
              // Swiped right -> previous card
              setActiveStep((currentIndex - 1 + totalSteps) % totalSteps, true);
            }
          }
        }
      }, { passive: true });
    }

    // Scroll listener with passive flag
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      updateCallout(currentIndex);
    }, { passive: true });

    // Initial activation
    setActiveStep(0, false);
  });
})();
