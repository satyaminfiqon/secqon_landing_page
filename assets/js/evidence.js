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
 * Evidence Section - Left-to-Right Carousel & Synchronized Content
 * - Scrolling DOWN: Active card exits to the RIGHT (.shuffling-to-right),
 *   upcoming card sweeps in from the LEFT (.entering-from-left) into active.
 * - Scrolling UP: Active card exits to the LEFT (.shuffling-to-left),
 *   previous card sweeps in from the RIGHT (.entering-from-right).
 * - Point click: Cascades through intermediate cards to reveal the selected card.
 * - Dynamic green SVG line: Automatically curves from the active point to the box.
 * - Mobile responsive: Flat sleek view on <=820px, 3D animated deck on desktop.
 * ==========================================================================
 */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const scrollTrack = document.getElementById('evidenceScrollTrack');
    const pointItems = Array.from(document.querySelectorAll('.evidence-point-item'));
    const cards = Array.from(new Set(document.querySelectorAll('#evidenceCardsDeck .cards, #evidenceCardsDeck .evidence-card, .evidence-cards-deck .cards, .evidence-cards-deck .evidence-card')))
      .sort((a, b) => {
        const aIdx = parseInt(a.getAttribute('data-card-index') || (a.id || '').replace(/\D/g, '') || 0, 10);
        const bIdx = parseInt(b.getAttribute('data-card-index') || (b.id || '').replace(/\D/g, '') || 0, 10);
        return aIdx - bIdx;
      });
    const deckElement = document.getElementById('evidenceCardsDeck');
    const wrapper = document.getElementById('evidencePointsWrapper');
    const calloutBox = document.querySelector('.evidence-callout-box');
    const calloutText = document.getElementById('evidenceCalloutText');
    const path = document.getElementById('evidenceCalloutPath');
    const startDot = document.getElementById('evidenceCalloutStartDot');
    const endDot = document.getElementById('evidenceCalloutEndDot');

    if (!cards || cards.length === 0 || pointItems.length === 0) return;

    const totalSteps = pointItems.length;
    let currentIndex = -1;
    let isManualScrolling = false;
    let scrollTimeout = null;
    let animTimeout = null;
    let cascadeTimer = null;

    // Slot layout:
    // Slot 0: active (front center)
    // Slot 1: left (upcoming card waiting on left side!)
    // Slot 2: left-2 (far left peeking card)
    // Slot 3: right-2 (far right departing card)
    // Slot 4: right (recently departed card resting on right side)
    const slotClasses = cards.length <= 3
      ? ['active', 'left', 'right']
      : ['active', 'left', 'left-2', 'right-2', 'right'];

    // Cancel any active cascading card dealing sequence
    const cancelCascade = () => {
      if (cascadeTimer) {
        clearTimeout(cascadeTimer);
        cascadeTimer = null;
      }
    };

    // 1. Update full 5-card 3D deck positions and trigger smooth animations
    const updateCardDeck = (newIndex, previousIndex, animate = true) => {
      if (animTimeout) {
        clearTimeout(animTimeout);
        animTimeout = null;
      }

      // Determine motion direction:
      // Scrolling down (0 -> 1 -> 2 -> 3 -> 4) or forward wrap (4 -> 0) is forward
      let isForward = true;
      if (previousIndex !== undefined && previousIndex !== newIndex) {
        const forwardDistance = (newIndex - previousIndex + totalSteps) % totalSteps;
        isForward = forwardDistance <= totalSteps / 2;
      }

      cards.forEach((card) => {
        if (!card.classList.contains('cards')) {
          card.classList.add('cards');
        }

        const dataIdx = card.getAttribute('data-card-index');
        const cardIdx = dataIdx !== null
          ? parseInt(dataIdx, 10)
          : parseInt((card.id || '').replace(/\D/g, ''), 10) || 0;

        const offset = (cardIdx - newIndex + totalSteps) % totalSteps;
        const targetClass = slotClasses[offset] || 'cards';

        // Strip old position and animation classes
        card.classList.remove(
          'active', 'left', 'left-2', 'right-2', 'right',
          'shuffling-to-right', 'entering-from-left',
          'shuffling-to-left', 'entering-from-right',
          'shuffling-cw', 'entering-cw', 'shuffling-ccw', 'entering-ccw'
        );
        card.classList.add(targetClass);

        // Apply deal flick & entrance arc animation on desktop (> 820px)
        if (animate && window.innerWidth > 820 && previousIndex !== undefined && previousIndex !== newIndex) {
          if (cardIdx === previousIndex) {
            // Active card exiting:
            // When scrolling DOWN (isForward): deals out to the RIGHT with a pop
            // When scrolling UP (!isForward): deals out to the LEFT
            card.classList.add(isForward ? 'shuffling-to-right' : 'shuffling-to-left');
          } else if (targetClass === 'active') {
            // Incoming card entering active:
            // When scrolling DOWN (isForward): sweeps in from the LEFT into center
            // When scrolling UP (!isForward): sweeps in from the RIGHT into center
            card.classList.add(isForward ? 'entering-from-left' : 'entering-from-right');
          }
        }

        card.setAttribute('aria-hidden', targetClass === 'active' ? 'false' : 'true');
      });

      if (animate && window.innerWidth > 820 && previousIndex !== undefined && previousIndex !== newIndex) {
        animTimeout = setTimeout(() => {
          cards.forEach((c) => {
            c.classList.remove(
              'shuffling-to-right', 'entering-from-left',
              'shuffling-to-left', 'entering-from-right',
              'shuffling-cw', 'entering-cw', 'shuffling-ccw', 'entering-ccw'
            );
          });
          animTimeout = null;
        }, 650);
      }
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
      }, 750);
    };

    // 5. Set active step across headings, green line, and 3D card deck
    const setActiveStep = (newStep, updateScroll = false, force = false, isIntermediate = false) => {
      if (newStep < 0) newStep = 0;
      if (newStep >= totalSteps) newStep = totalSteps - 1;

      if (!force && newStep === currentIndex && !updateScroll) return;

      const prevStep = currentIndex;
      currentIndex = newStep;

      // Rotate all cards in circular 3D deck and reveal target content
      updateCardDeck(newStep, prevStep >= 0 ? prevStep : undefined, prevStep >= 0);

      // Synchronize left heading points highlight
      pointItems.forEach((item, idx) => {
        const isActive = idx === newStep;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update mobile stepper dots
      const stepperDots = document.querySelectorAll('.mobile-step-dot');
      stepperDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === newStep);
        dot.setAttribute('aria-current', idx === newStep ? 'true' : 'false');
      });

      // On intermediate steps in a cascade, skip heavy redraw of callout text and SVG line
      if (!isIntermediate) {
        updateCalloutText(newStep);
        requestAnimationFrame(() => updateGreenLine(newStep));
      }

      if (updateScroll) {
        scrollToStep(newStep);
      }
    };

    // 6. Multi-step point click cascading shuffle:
    // When jumping points (e.g. from first to last point), rapidly shuffles cards to the target
    const triggerPointTransition = (targetIndex) => {
      if (targetIndex === currentIndex) {
        // If already active, advance forward by 1 (circular)
        targetIndex = (currentIndex + 1) % totalSteps;
      }

      cancelCascade();

      const startStep = currentIndex;
      const diff = targetIndex - startStep;

      // If on mobile or only 1 step away, perform direct smooth transition
      if (window.innerWidth <= 820 || Math.abs(diff) === 1 || (startStep === totalSteps - 1 && targetIndex === 0) || (startStep === 0 && targetIndex === totalSteps - 1)) {
        setActiveStep(targetIndex, true, false, false);
        return;
      }

      // Multi-step jump:
      // Build intermediate step sequence so all cards deal and shuffle to the target
      const steps = [];
      if (diff > 0) {
        for (let s = startStep + 1; s <= targetIndex; s++) {
          steps.push(s);
        }
      } else {
        for (let s = startStep - 1; s >= targetIndex; s--) {
          steps.push(s);
        }
      }

      // Snappy step interval so cascading cards deal continuously across screen
      const stepInterval = Math.max(130, Math.min(170, Math.floor(580 / steps.length)));

      let stepIdx = 0;
      isManualScrolling = true;
      clearTimeout(scrollTimeout);

      function executeCascade() {
        if (stepIdx >= steps.length) {
          cascadeTimer = null;
          isManualScrolling = false;
          return;
        }

        const nextStep = steps[stepIdx];
        const isLast = (stepIdx === steps.length - 1);

        // Intermediate steps deal quickly; final step updates scroll, callout, and green line
        setActiveStep(nextStep, isLast, false, !isLast);

        stepIdx++;
        if (!isLast) {
          cascadeTimer = setTimeout(executeCascade, stepInterval);
        } else {
          cascadeTimer = null;
        }
      }

      executeCascade();
    };

    // 7. Card click interaction:
    // Clicking active front card triggers advance to next step
    // Clicking a peeking side card cascades/shuffles directly to that card
    const changePositions = (e) => {
      const clickedCard = e.currentTarget;
      const dataIdx = clickedCard.getAttribute('data-card-index');
      const clickedIdx = dataIdx !== null
        ? parseInt(dataIdx, 10)
        : parseInt((clickedCard.id || '').replace(/\D/g, ''), 10) || 0;

      if (clickedCard.classList.contains('active')) {
        // Active card clicked: advance to next card in deck
        triggerPointTransition((currentIndex + 1) % totalSteps);
      } else {
        // Peeking card clicked: cascade/shuffle to bring that card to active
        triggerPointTransition(clickedIdx);
      }
    };

    // Attach card click handlers
    cards.forEach((card) => {
      card.addEventListener('click', changePositions);
    });

    // Also allow clicking deck background to advance
    if (deckElement) {
      deckElement.addEventListener('click', (e) => {
        if (!e.target.closest('.evidence-card, .cards')) {
          triggerPointTransition((currentIndex + 1) % totalSteps);
        }
      });
    }

    // Attach heading point click handlers
    pointItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        triggerPointTransition(index);
      });
    });

    // Attach mobile stepper dot click handlers
    document.querySelectorAll('.mobile-step-dot').forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const step = parseInt(e.currentTarget.getAttribute('data-step'), 10);
        if (!isNaN(step)) {
          triggerPointTransition(step);
        }
      });
    });

    // 8. Scroll handler: updates active card & heading as user scrolls through the track
    const handleScroll = () => {
      if (isManualScrolling || !scrollTrack) return;

      const rect = scrollTrack.getBoundingClientRect();
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;

      if (scrollDistance <= 0) return;

      // Only process when track intersects viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));
      const calculatedStep = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

      if (calculatedStep !== currentIndex) {
        cancelCascade();
        setActiveStep(calculatedStep, false);
      }
    };

    // 9. Mobile touch swipe gesture support (Swipe Up / Down / Left / Right)
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
                triggerPointTransition((currentIndex + 1) % totalSteps);
              } else {
                // Swiped DOWN -> Show previous heading & card content
                triggerPointTransition((currentIndex - 1 + totalSteps) % totalSteps);
              }
            }
            // Horizontal swipe (Left -> next, Right -> previous)
            else if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
              if (diffX < 0) {
                triggerPointTransition((currentIndex + 1) % totalSteps);
              } else {
                triggerPointTransition((currentIndex - 1 + totalSteps) % totalSteps);
              }
            }
          }
        }
      }, { passive: true });
    }

    // Scroll & Resize listeners
    window.addEventListener('scroll', handleScroll, { passive: true });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateGreenLine(currentIndex);
        updateCardDeck(currentIndex, undefined, false);
      }, 100);
    }, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        updateGreenLine(currentIndex);
        updateCardDeck(currentIndex, undefined, false);
      }, 150);
    }, { passive: true });

    // Initialize layout and state
    setActiveStep(0, false, true);
    setTimeout(() => {
      updateGreenLine(0);
    }, 100);
  });
})();
