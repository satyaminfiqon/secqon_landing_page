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
          'shuffling-cw', 'entering-cw', 'shuffling-ccw', 'entering-ccw',
          'mobile-card-slide-up-out', 'mobile-card-slide-up-in',
          'mobile-card-slide-down-out', 'mobile-card-slide-down-in'
        );
        card.classList.add(targetClass);

        if (animate && previousIndex !== undefined && previousIndex !== newIndex && window.innerWidth > 820) {
          // Apply deal flick & entrance arc animation on desktop (> 820px)
          if (cardIdx === previousIndex) {
            card.classList.add(isForward ? 'shuffling-to-right' : 'shuffling-to-left');
          } else if (targetClass === 'active') {
            card.classList.add(isForward ? 'entering-from-left' : 'entering-from-right');
          }
        }

        card.setAttribute('aria-hidden', targetClass === 'active' ? 'false' : 'true');
      });

      if (animate && previousIndex !== undefined && previousIndex !== newIndex) {
        animTimeout = setTimeout(() => {
          cards.forEach((c) => {
            c.classList.remove(
              'shuffling-to-right', 'entering-from-left',
              'shuffling-to-left', 'entering-from-right',
              'shuffling-cw', 'entering-cw', 'shuffling-ccw', 'entering-ccw'
            );
          });
          animTimeout = null;
        }, 550);
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
        let x1 = Math.round(itemRect.right - wrapperRect.left + 6);
        const y1 = Math.round(itemRect.top - wrapperRect.top + itemRect.height / 2);

        let x2 = Math.round(boxRect.left - wrapperRect.left - 2);
        const y2 = Math.round(boxRect.top - wrapperRect.top + boxRect.height / 2);

        // Safety clamping: ensure x1 is always forward towards x2 with at least 10px gap
        if (x2 <= x1 + 8) {
          x1 = Math.max(Math.round(itemRect.left - wrapperRect.left + 24), x2 - 12);
        }

        const deltaX = Math.max(12, x2 - x1);
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
    const updateCalloutText = (activeIdx, isForward = true) => {
      const activeItem = pointItems[activeIdx];
      if (!activeItem || !calloutText) return;

      const calloutMessage = activeItem.getAttribute('data-callout') || '';
      if (calloutText.textContent === calloutMessage) return;

      if (window.innerWidth <= 820 && calloutBox) {
        calloutBox.classList.remove('anim-forward', 'anim-backward');
        void calloutBox.offsetWidth;
        calloutBox.classList.add(isForward ? 'anim-forward' : 'anim-backward');
      }

      calloutText.style.opacity = '0';
      calloutText.style.transform = isForward ? 'translateY(4px)' : 'translateY(-4px)';

      setTimeout(() => {
        calloutText.textContent = calloutMessage;
        calloutText.style.opacity = '1';
        calloutText.style.transform = 'translateY(0)';
      }, 100);
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

      // Determine motion direction
      let isForward = true;
      if (prevStep >= 0 && prevStep !== newStep) {
        const forwardDistance = (newStep - prevStep + totalSteps) % totalSteps;
        isForward = forwardDistance <= totalSteps / 2;
      }

      // Rotate all cards in circular 3D deck and reveal target content
      updateCardDeck(newStep, prevStep >= 0 ? prevStep : undefined, prevStep >= 0);

      // Synchronize left heading points highlight
      pointItems.forEach((item, idx) => {
        const isActive = idx === newStep;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');

        // On mobile, animate active point transition
        if (isActive && window.innerWidth <= 820 && prevStep >= 0 && prevStep !== newStep) {
          item.classList.remove('anim-forward', 'anim-backward');
          void item.offsetWidth;
          item.classList.add(isForward ? 'anim-forward' : 'anim-backward');
        }
      });

      // Update mobile stepper dots
      const stepperDots = document.querySelectorAll('.mobile-step-dot');
      stepperDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === newStep);
        dot.setAttribute('aria-current', idx === newStep ? 'true' : 'false');
      });

      // On intermediate steps in a cascade, skip heavy redraw of callout text and SVG line
      if (!isIntermediate) {
        updateCalloutText(newStep, isForward);
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

    // ==========================================================================
    // 7. Mobile Continuous LERP Animation Engine (Matches Stages Section)
    // - Silky 60/120fps continuous scrub with physics-based LERP
    // - Size reduces progressively (scale 1.0 -> 0.76) as card lifts upward
    // - Next card glides upward from below
    // - Point + Details + Card grouped as one unified animated object!
    // ==========================================================================
    const totalCards = cards.length;
    const maxMobileProgress = totalCards - 1;

    let mobileTargetProgress = 0;   // 0.0 to 4.0
    let mobileCurrentProgress = 0;  // Smoothly interpolated
    let isMobileAnimating = false;

    // S-curve with smooth acceleration and deceleration (exact formula from stages.js)
    function smootherstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    // Map scroll distance to mobile stage progress with resting plateaus
    function computeMobileTargetProgress() {
      if (!scrollTrack) return mobileTargetProgress;
      const rect = scrollTrack.getBoundingClientRect();
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;

      if (scrollDistance <= 40) return mobileTargetProgress;

      const scrolled = -rect.top;
      const linearProgress = Math.max(0, Math.min(1, scrolled / scrollDistance));

      // Divide into intervals with smoothstep easing between cards
      const rawP = linearProgress * maxMobileProgress;
      const cardIdx = Math.floor(rawP);
      const frac = rawP - cardIdx;

      if (cardIdx >= maxMobileProgress) {
        return maxMobileProgress;
      }

      // Eased fraction provides resting zones and smooth transitions
      const easedFrac = smootherstep(frac);
      return cardIdx + easedFrac;
    }

    // Apply exact stages 3D transforms & opacities based on smooth progress
    function applyMobileTransforms(p) {
      cards.forEach((card, i) => {
        const rel = p - i;
        const maxLift = Math.min(85, Math.round((card.offsetHeight || 380) * 0.18) || 68);

        if (rel >= 0) {
          // Card i is currently in view or has been scrolled past (exiting upward)
          if (rel >= 1.0) {
            // Completely passed
            card.style.transform = `translate3d(0, -${maxLift}px, 0) scale(0.76)`;
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
            card.style.pointerEvents = 'none';
            card.style.zIndex = '1';
          } else {
            // In active view or smoothly shrinking & lifting (rel from 0.0 to 1.0)
            const t = rel;
            const scale = 1.0 - t * 0.24; // Visibly reduces size down to 0.76 (exact match to stages)
            const translateY = -t * maxLift; // Proportional upward translation based on card height
            const opacity = Math.max(0, 1.0 - t * 1.15); // Smooth fade out

            card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
            card.style.opacity = opacity.toFixed(3);
            card.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
            card.style.pointerEvents = rel < 0.25 ? 'auto' : 'none';
            card.style.zIndex = String(10 + i);
          }
        } else {
          // rel < 0: Card is entering from below or waiting
          if (rel <= -1.0) {
            // Waiting completely below
            card.style.transform = 'translate3d(0, 100%, 0) scale(0.95)';
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
            card.style.pointerEvents = 'none';
            card.style.zIndex = '1';
          } else {
            // Entering upward from below (rel from -1.0 to 0.0)
            const enter = 1.0 + rel; // 0.0 to 1.0
            const translateYPercent = (1.0 - enter) * 100;
            const scale = 0.94 + enter * 0.06; // Expands from 0.94 up to 1.0
            const opacity = Math.min(1.0, enter * 1.5);

            card.style.transform = `translate3d(0, ${translateYPercent.toFixed(2)}%, 0) scale(${scale.toFixed(3)})`;
            card.style.opacity = opacity.toFixed(3);
            card.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
            card.style.pointerEvents = enter > 0.75 ? 'auto' : 'none';
            card.style.zIndex = String(10 + i);
          }
        }

        const isCurrentlyActive = Math.round(p) === i;
        card.setAttribute('aria-hidden', isCurrentlyActive ? 'false' : 'true');
      });

      // Synchronize mobile stepper dots if present
      const activeIdx = Math.max(0, Math.min(maxMobileProgress, Math.round(p)));
      document.querySelectorAll('.mobile-step-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIdx);
        dot.setAttribute('aria-current', idx === activeIdx ? 'true' : 'false');
      });
    }

    // Animation LERP loop for mobile (buttery 60/120fps motion)
    function mobileRenderLoop() {
      if (window.innerWidth > 820) {
        isMobileAnimating = false;
        return;
      }

      const diff = mobileTargetProgress - mobileCurrentProgress;

      if (Math.abs(diff) > 0.0004) {
        // High quality damping factor for buttery responsiveness
        mobileCurrentProgress += diff * 0.11;
        applyMobileTransforms(mobileCurrentProgress);
        requestAnimationFrame(mobileRenderLoop);
      } else {
        mobileCurrentProgress = mobileTargetProgress;
        applyMobileTransforms(mobileCurrentProgress);
        isMobileAnimating = false; // Sleep when settled to save CPU
      }
    }

    function wakeMobileAnimation() {
      if (window.innerWidth <= 820 && !isMobileAnimating) {
        isMobileAnimating = true;
        requestAnimationFrame(mobileRenderLoop);
      }
    }

    // Smooth scroll to a mobile step
    function scrollToMobileStep(stepIndex) {
      if (!scrollTrack) return;
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) return;
      const trackTop = window.pageYOffset + scrollTrack.getBoundingClientRect().top;
      const targetScroll = trackTop + (stepIndex / maxMobileProgress) * scrollDistance;

      isManualScrolling = true;
      clearTimeout(scrollTimeout);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      scrollTimeout = setTimeout(() => {
        isManualScrolling = false;
      }, 700);
    }

    // Reset inline styles when switching back to desktop
    function resetCardsForDesktop() {
      isMobileAnimating = false;
      cards.forEach((card) => {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.visibility = '';
        card.style.pointerEvents = '';
        card.style.zIndex = '';
      });
      updateCardDeck(currentIndex >= 0 ? currentIndex : 0, undefined, false);
      updateGreenLine(currentIndex >= 0 ? currentIndex : 0);
    }

    // 8. Card click interaction:
    // On desktop: clicking active front card advances; clicking peeking side card cascades
    // On mobile: clicking card advances to next card
    const changePositions = (e) => {
      if (window.innerWidth <= 820) {
        const nextStep = (Math.round(mobileTargetProgress) + 1) % totalCards;
        mobileTargetProgress = nextStep;
        wakeMobileAnimation();
        scrollToMobileStep(nextStep);
        return;
      }

      const clickedCard = e.currentTarget;
      const dataIdx = clickedCard.getAttribute('data-card-index');
      const clickedIdx = dataIdx !== null
        ? parseInt(dataIdx, 10)
        : parseInt((clickedCard.id || '').replace(/\D/g, ''), 10) || 0;

      if (clickedCard.classList.contains('active')) {
        triggerPointTransition((currentIndex + 1) % totalSteps);
      } else {
        triggerPointTransition(clickedIdx);
      }
    };

    // Attach card click handlers
    cards.forEach((card) => {
      card.addEventListener('click', changePositions);
    });

    // Also allow clicking deck background on desktop to advance
    if (deckElement) {
      deckElement.addEventListener('click', (e) => {
        if (window.innerWidth <= 820) {
          const nextStep = (Math.round(mobileTargetProgress) + 1) % totalCards;
          mobileTargetProgress = nextStep;
          wakeMobileAnimation();
          scrollToMobileStep(nextStep);
          return;
        }
        if (!e.target.closest('.evidence-card, .cards')) {
          triggerPointTransition((currentIndex + 1) % totalSteps);
        }
      });
    }

    // Attach mobile stage header point click handlers (point + radio inside mobile slide)
    document.querySelectorAll('.evidence-stage-point').forEach((point) => {
      point.addEventListener('click', (e) => {
        if (window.innerWidth <= 820) {
          e.stopPropagation();
          const nextStep = (Math.round(mobileTargetProgress) + 1) % totalCards;
          mobileTargetProgress = nextStep;
          wakeMobileAnimation();
          scrollToMobileStep(nextStep);
        }
      });
    });

    // Attach desktop heading point click handlers
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
          if (window.innerWidth <= 820) {
            mobileTargetProgress = step;
            wakeMobileAnimation();
            scrollToMobileStep(step);
          } else {
            triggerPointTransition(step);
          }
        }
      });
    });

    // 9. Scroll handler:
    // On mobile: smoothly computes targetProgress and drives LERP loop
    // On desktop: updates active card & heading as user scrolls through track
    const handleScroll = () => {
      if (window.innerWidth <= 820) {
        if (!isManualScrolling) {
          mobileTargetProgress = computeMobileTargetProgress();
          wakeMobileAnimation();
        }
        return;
      }

      if (isManualScrolling || !scrollTrack) return;

      const rect = scrollTrack.getBoundingClientRect();
      const scrollDistance = scrollTrack.offsetHeight - window.innerHeight;

      if (scrollDistance <= 0) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollDistance));
      const calculatedStep = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

      if (calculatedStep !== currentIndex) {
        cancelCascade();
        setActiveStep(calculatedStep, false);
      }
    };

    // 10. Mobile touch swipe gesture support (Swipe Up / Down / Left / Right)
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
            if (window.innerWidth <= 820) {
              // Mobile vertical or horizontal swipe
              // Swiping UP or LEFT -> advance to next
              if ((diffY < -35 && Math.abs(diffY) > Math.abs(diffX)) || (diffX < -35 && Math.abs(diffX) > Math.abs(diffY))) {
                const nextStep = Math.min(maxMobileProgress, Math.round(mobileTargetProgress + 1));
                mobileTargetProgress = nextStep;
                wakeMobileAnimation();
                scrollToMobileStep(nextStep);
              }
              // Swiping DOWN or RIGHT -> return to previous
              else if ((diffY > 35 && Math.abs(diffY) > Math.abs(diffX)) || (diffX > 35 && Math.abs(diffX) > Math.abs(diffY))) {
                const prevStep = Math.max(0, Math.round(mobileTargetProgress - 1));
                mobileTargetProgress = prevStep;
                wakeMobileAnimation();
                scrollToMobileStep(prevStep);
              }
            } else {
              // Desktop swipe
              if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX < 0) {
                  triggerPointTransition((currentIndex + 1) % totalSteps);
                } else {
                  triggerPointTransition((currentIndex - 1 + totalSteps) % totalSteps);
                }
              }
            }
          }
        }
      }, { passive: true });
    }

    // Scroll & Resize listeners
    window.addEventListener('scroll', handleScroll, { passive: true });

    let resizeTimer = null;
    let wasMobile = window.innerWidth <= 820;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isMobileNow = window.innerWidth <= 820;
        if (!isMobileNow) {
          resetCardsForDesktop();
        } else {
          mobileTargetProgress = computeMobileTargetProgress();
          mobileCurrentProgress = mobileTargetProgress;
          applyMobileTransforms(mobileCurrentProgress);
          wakeMobileAnimation();
        }
        wasMobile = isMobileNow;
      }, 100);
    }, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        const isMobileNow = window.innerWidth <= 820;
        if (!isMobileNow) {
          resetCardsForDesktop();
        } else {
          mobileTargetProgress = computeMobileTargetProgress();
          mobileCurrentProgress = mobileTargetProgress;
          applyMobileTransforms(mobileCurrentProgress);
          wakeMobileAnimation();
        }
      }, 150);
    }, { passive: true });

    // Initialize layout and state
    if (window.innerWidth <= 820) {
      mobileTargetProgress = computeMobileTargetProgress();
      mobileCurrentProgress = mobileTargetProgress;
      applyMobileTransforms(mobileCurrentProgress);
      wakeMobileAnimation();
    } else {
      setActiveStep(0, false, true);
      setTimeout(() => {
        updateGreenLine(0);
      }, 100);
    }
  });
})();
