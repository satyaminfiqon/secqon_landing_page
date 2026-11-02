/* ==========================================================================
   PREVIOUS IMPLEMENTATION (COMMENTED OUT AS REQUESTED)
   ==========================================================================
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

    function updateCardDeck(activeIdx, previousIdx) {
      cards.forEach((card, i) => {
        const rank = (i - activeIdx + totalSteps) % totalSteps;
        const config = deckTransforms[rank] || deckTransforms[deckTransforms.length - 1];

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

    function updateCallout(activeIdx) {
      const activeItem = pointItems[activeIdx];
      if (!activeItem || !calloutWrap || !calloutText) return;

      const calloutMessage = activeItem.getAttribute('data-callout') || '';

      calloutText.style.opacity = '0';
      calloutText.style.transform = 'translateY(4px)';

      setTimeout(() => {
        calloutText.textContent = calloutMessage;
        calloutText.style.opacity = '1';
        calloutText.style.transform = 'translateY(0)';
      }, 150);

      const itemTop = activeItem.offsetTop;
      calloutWrap.style.transform = `translateY(${itemTop}px)`;
    }

    function setActiveStep(newIndex, updateScroll = false) {
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= totalSteps) newIndex = totalSteps - 1;

      const prevIndex = currentIndex;
      currentIndex = newIndex;

      pointItems.forEach((item, idx) => {
        if (idx === currentIndex) {
          item.classList.add('active');
          item.setAttribute('aria-selected', 'true');
        } else {
          item.classList.remove('active');
          item.setAttribute('aria-selected', 'false');
        }
      });

      updateCallout(currentIndex);
      updateCardDeck(currentIndex, prevIndex);

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

    function handleScroll() {
      if (isManualScrolling || window.innerWidth <= 992) return;

      const rect = scrollTrack.getBoundingClientRect();
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;

      if (scrollDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));

      const calculatedIndex = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

      if (calculatedIndex !== currentIndex) {
        setActiveStep(calculatedIndex, false);
      }
    }

    pointItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        setActiveStep(index, true);
      });
    });

    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        setActiveStep(index, true);
      });
    });

    if (deckElement) {
      touchStartX = 0;
      touchStartY = 0;

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
              setActiveStep((currentIndex + 1) % totalSteps, true);
            } else {
              setActiveStep((currentIndex - 1 + totalSteps) % totalSteps, true);
            }
          }
        }
      }, { passive: true });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      updateCallout(currentIndex);
    }, { passive: true });

    setActiveStep(0, false);
  });
})();
========================================================================== */

/**
 * ==========================================================================
 * Evidence Section - Interactive 3D Card Shuffle & Synchronized Scroll
 * - Scroll synchronization: Scrolling page changes card according to left heading
 * - Fixed callout description box: Position is fixed, never jumps around
 * - Dynamic green SVG line: Automatically curves from the active point to the box
 * - User card swap mechanics: Cards swap class positions cleanly on click or scroll
 * - Fully responsive across all devices (Desktop, Tablet, Mobile)
 * ==========================================================================
 */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const scrollTrack = document.getElementById('evidenceScrollTrack');
    const pointItems = Array.from(document.querySelectorAll('.evidence-point-item'));
    const cards = Array.from(document.querySelectorAll('.cards, .evidence-card'));
    const deckElement = document.getElementById('evidenceCardsDeck');
    const wrapper = document.getElementById('evidencePointsWrapper');
    const calloutBox = document.querySelector('.evidence-callout-box');
    const calloutText = document.getElementById('evidenceCalloutText');
    const path = document.getElementById('evidenceCalloutPath');
    const startDot = document.getElementById('evidenceCalloutStartDot');
    const endDot = document.getElementById('evidenceCalloutEndDot');

    if (!cards || cards.length === 0 || pointItems.length === 0) return;

    const totalSteps = pointItems.length;
    let currentIndex = 0;
    let isManualScrolling = false;
    let scrollTimeout = null;

    // 1. Initial 3D position classes for cards
    const setClasses = () => {
      const classes = cards.length <= 3
        ? ['left', 'active', 'right']
        : ['active', 'right', 'right-2', 'left-2', 'left'];

      cards.forEach((card, index) => {
        if (!card.classList.contains('cards')) {
          card.classList.add('cards');
        }
        if (classes[index]) {
          card.classList.add(classes[index]);
        }
      });
    };

    // 2. Dynamic Green SVG Connector Line from active heading to fixed description box
    const updateGreenLine = (activeIdx) => {
      const activeItem = pointItems[activeIdx];
      if (!wrapper || !activeItem || !calloutBox || !path) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const boxRect = calloutBox.getBoundingClientRect();

      if (wrapperRect.width === 0 || itemRect.width === 0 || boxRect.width === 0) return;

      // Determine whether points list and callout box are side-by-side or stacked vertically
      const isSideBySide = boxRect.left >= (itemRect.left + 50);

      if (isSideBySide) {
        // Desktop / Tablet side-by-side:
        // Connect from the right edge of active heading item to the left edge of fixed callout box
        const x1 = Math.round(itemRect.right - wrapperRect.left + 8);
        const y1 = Math.round(itemRect.top - wrapperRect.top + itemRect.height / 2);

        const x2 = Math.round(boxRect.left - wrapperRect.left - 2);
        const y2 = Math.round(boxRect.top - wrapperRect.top + boxRect.height / 2);

        const deltaX = Math.max(16, x2 - x1);
        const cp1x = Math.round(x1 + deltaX * 0.45);
        const cp1y = y1;
        const cp2x = Math.round(x1 + deltaX * 0.55);
        const cp2y = y2;

        const d = `M ${x1},${y1} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
        path.setAttribute('d', d);
        path.style.opacity = '1';

        if (startDot) {
          startDot.setAttribute('cx', x1);
          startDot.setAttribute('cy', y1);
          startDot.style.opacity = '1';
        }
        if (endDot) {
          endDot.setAttribute('cx', x2);
          endDot.setAttribute('cy', y2);
          endDot.style.opacity = '1';
        }
      } else {
        // Mobile stacked view:
        // Connect from the active radio dot down to top edge of fixed callout box
        const radioEl = activeItem.querySelector('.point-radio') || activeItem;
        const radioRect = radioEl.getBoundingClientRect();

        const x1 = Math.round(radioRect.left - wrapperRect.left + radioRect.width / 2);
        const y1 = Math.round(radioRect.bottom - wrapperRect.top + 3);

        const x2 = Math.round(boxRect.left - wrapperRect.left + 22);
        const y2 = Math.round(boxRect.top - wrapperRect.top - 2);

        const deltaY = Math.max(14, y2 - y1);
        const cp1x = x1;
        const cp1y = Math.round(y1 + deltaY * 0.45);
        const cp2x = x2;
        const cp2y = Math.round(y1 + deltaY * 0.55);

        const d = `M ${x1},${y1} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
        path.setAttribute('d', d);
        path.style.opacity = '1';

        if (startDot) {
          startDot.setAttribute('cx', x1);
          startDot.setAttribute('cy', y1);
          startDot.style.opacity = '1';
        }
        if (endDot) {
          endDot.setAttribute('cx', x2);
          endDot.setAttribute('cy', y2);
          endDot.style.opacity = '1';
        }
      }
    };

    // 3. Update Callout text inside the fixed position box
    const updateCalloutText = (activeIdx) => {
      const activeItem = pointItems[activeIdx];
      if (!activeItem || !calloutText) return;

      const calloutMessage = activeItem.getAttribute('data-callout') || '';
      if (calloutText.textContent === calloutMessage) return;

      calloutText.style.opacity = '0';
      calloutText.style.transform = 'translateY(3px)';

      setTimeout(() => {
        calloutText.textContent = calloutMessage;
        calloutText.style.opacity = '1';
        calloutText.style.transform = 'translateY(0)';
      }, 120);
    };

    // 4. Smooth scrolling to step in the scroll track
    const scrollToStep = (stepIndex) => {
      if (!scrollTrack) return;
      const trackRect = scrollTrack.getBoundingClientRect();
      const absoluteTrackTop = window.pageYOffset + trackRect.top;
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) return;

      // Position scroll travel at the center of the step's segment
      const targetProgress = (stepIndex + 0.5) / totalSteps;
      const targetY = absoluteTrackTop + targetProgress * scrollDistance;

      isManualScrolling = true;
      clearTimeout(scrollTimeout);

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });

      scrollTimeout = setTimeout(() => {
        isManualScrolling = false;
      }, 650);
    };

    // 5. Set active step across headings, green line, and 3D card deck
    const setActiveStep = (newStep, updateScroll = false) => {
      if (newStep < 0) newStep = 0;
      if (newStep >= totalSteps) newStep = totalSteps - 1;

      currentIndex = newStep;

      // Swap target card into active slot if not already active
      const targetCard = document.querySelector(`.cards[data-card-index="${newStep}"], #card-${newStep}`);
      const activeCard = document.querySelector('.cards.active');

      if (targetCard && activeCard && targetCard !== activeCard) {
        const classesFrom = targetCard.className;
        const classesTo = activeCard.className;
        targetCard.className = classesTo;
        activeCard.className = classesFrom;
      }

      // Synchronize left heading points highlight
      pointItems.forEach((item, idx) => {
        const isActive = idx === newStep;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update card accessibility
      cards.forEach((card) => {
        card.setAttribute('aria-hidden', card.classList.contains('active') ? 'false' : 'true');
      });

      // Update mobile stepper dots
      const stepperDots = document.querySelectorAll('.mobile-step-dot');
      stepperDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === newStep);
        dot.setAttribute('aria-current', idx === newStep ? 'true' : 'false');
      });

      // Update callout text & green line
      updateCalloutText(newStep);
      requestAnimationFrame(() => updateGreenLine(newStep));

      if (updateScroll) {
        scrollToStep(newStep);
      }
    };

    // 6. Card click swap logic (user's specification)
    const changePositions = (e) => {
      const clickedCard = e.currentTarget;
      const activeCard = document.querySelector('.cards.active');
      if (!activeCard || clickedCard.classList.contains('active')) return;

      const classesFrom = clickedCard.className;
      const classesTo = activeCard.className;
      clickedCard.className = classesTo;
      activeCard.className = classesFrom;

      const dataIdx = clickedCard.getAttribute('data-card-index');
      const newIdx = dataIdx !== null
        ? parseInt(dataIdx, 10)
        : parseInt((clickedCard.id || '').replace(/\D/g, ''), 10) || 0;

      setActiveStep(newIdx, true);
    };

    // Attach card click handlers
    cards.forEach((card) => {
      card.addEventListener('click', changePositions);
    });

    // Attach heading point click handlers
    pointItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 820) {
          // On mobile view, tapping the active heading advances to next card
          setActiveStep((currentIndex + 1) % totalSteps, true);
        } else {
          setActiveStep(index, true);
        }
      });
    });

    // Attach mobile stepper dot click handlers
    document.querySelectorAll('.mobile-step-dot').forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const step = parseInt(e.currentTarget.getAttribute('data-step'), 10);
        if (!isNaN(step)) {
          setActiveStep(step, true);
        }
      });
    });

    // 7. Scroll handler: updates active card & heading as user scrolls through the track
    const handleScroll = () => {
      if (isManualScrolling || !scrollTrack) return;

      const rect = scrollTrack.getBoundingClientRect();
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;

      if (scrollDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));
      const calculatedStep = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

      if (calculatedStep !== currentIndex) {
        setActiveStep(calculatedStep, false);
      }
    };

    // 8. Mobile touch swipe gesture support (Swipe Up / Down / Left / Right)
    const touchArea = document.getElementById('evidenceStickyWrapper') || document.getElementById('report-details') || deckElement;

    if (touchArea) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      touchArea.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }
      }, { passive: true });

      touchArea.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const diffX = e.changedTouches[0].clientX - touchStartX;
          const diffY = e.changedTouches[0].clientY - touchStartY;
          const duration = Date.now() - touchStartTime;

          // Process swipe if completed within 650ms
          if (duration < 650) {
            // Vertical swipe (Swiping up advances to next; swiping down goes to previous)
            if (Math.abs(diffY) > 35 && Math.abs(diffY) > Math.abs(diffX)) {
              if (diffY < 0) {
                // Swiped UP -> Show next heading & card content
                setActiveStep((currentIndex + 1) % totalSteps, true);
              } else {
                // Swiped DOWN -> Show previous heading & card content
                setActiveStep((currentIndex - 1 + totalSteps) % totalSteps, true);
              }
            }
            // Horizontal swipe (Left -> next, Right -> previous)
            else if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
              if (diffX < 0) {
                setActiveStep((currentIndex + 1) % totalSteps, true);
              } else {
                setActiveStep((currentIndex - 1 + totalSteps) % totalSteps, true);
              }
            }
          }
        }
      }, { passive: true });
    }

    // Scroll & Resize listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      updateGreenLine(currentIndex);
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => updateGreenLine(currentIndex), 150);
    }, { passive: true });

    // Initialize layout and state
    setClasses();
    setActiveStep(0, false);
    setTimeout(() => {
      updateGreenLine(0);
    }, 100);
  });
})();
