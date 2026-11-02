/**
 * Security Section Controller
 *
 * 1. Desktop Mode (> 992px):
 *    - Left image viewer stays sticky and full viewport height & width.
 *    - Right text sections scroll normally.
 *    - Image automatically slides when a text section reaches center of viewport.
 *    - Active text section is highlighted.
 *    - Clicking a text step smoothly scrolls to it.
 *
 * 2. Mobile Mode (<= 992px):
 *    - Ultra-smooth continuous card deck slide & size reduction engine.
 *    - Each card displays Image first (top), then Content (bottom).
 *    - Matches the card scrolling transition of the Stages section above.
 *    - Physics-based LERP interpolation on requestAnimationFrame (60/120fps).
 *    - Touch swipe gestures & interactive pagination dots.
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Desktop Synchronized Sticky Scroll Controller (> 992px)
       ========================================================================== */
    const track = document.getElementById('securityImageTrack');
    const imageFrame = document.querySelector('.security-image-frame');
    const steps = Array.from(document.querySelectorAll('.security-text-step'));

    let desktopCurrentIndex = -1;
    let desktopIsTicking = false;

    function getImageHeight() {
      return imageFrame ? imageFrame.clientHeight : 0;
    }

    function changeDesktopImage(index) {
      if (!track || !imageFrame) return;
      const imageHeight = getImageHeight();
      track.style.transform = `translate3d(0, -${index * imageHeight}px, 0)`;
    }

    function updateDesktopActiveStep() {
      if (window.innerWidth <= 992 || steps.length === 0) return;

      const triggerY = window.innerHeight * 0.5;
      let activeIndex = 0;
      let minDistance = Infinity;

      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const distance = Math.abs(stepCenter - triggerY);

        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      if (activeIndex !== desktopCurrentIndex) {
        desktopCurrentIndex = activeIndex;

        steps.forEach((step, index) => {
          step.classList.toggle('active', index === desktopCurrentIndex);
        });

        changeDesktopImage(desktopCurrentIndex);
      }

      desktopIsTicking = false;
    }

    function onDesktopScroll() {
      if (window.innerWidth <= 992) return;

      if (!desktopIsTicking) {
        desktopIsTicking = true;
        requestAnimationFrame(updateDesktopActiveStep);
      }
    }

    steps.forEach((step) => {
      step.addEventListener('click', () => {
        if (window.innerWidth > 992) {
          step.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      });
    });


    /* ==========================================================================
       2. Mobile Card Deck Scroll & Animation Controller (<= 992px)
          Matches the smooth continuous deck slide & size reduction of the Stages section
       ========================================================================== */
    const mobileScrollWrapper = document.querySelector('.security-mobile-scroll-wrapper');
    const deckCards = Array.from(document.querySelectorAll('.security-deck-card'));
    const mobileDots = Array.from(document.querySelectorAll('.sec-dot'));

    let mobileTargetProgress = 0;
    let mobileCurrentProgress = 0;
    let mobileIsAnimating = false;
    let mobileActiveDotIndex = 0;

    const totalMobileCards = deckCards.length;
    const maxMobileProgress = Math.max(0, totalMobileCards - 1);

    function smootherstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function computeMobileProgress() {
      if (!mobileScrollWrapper) return 0;
      const rect = mobileScrollWrapper.getBoundingClientRect();
      const scrollDistance = mobileScrollWrapper.offsetHeight - window.innerHeight;

      if (scrollDistance <= 50) return mobileTargetProgress;

      const scrolled = -rect.top;
      const linearProgress = Math.max(0, Math.min(1, scrolled / scrollDistance));

      const rawP = linearProgress * maxMobileProgress;
      const stage = Math.floor(rawP);
      const frac = rawP - stage;

      if (stage >= maxMobileProgress) {
        return maxMobileProgress;
      }

      const easedFrac = smootherstep(frac);
      return stage + easedFrac;
    }

    function updateMobileDots(p) {
      if (mobileDots.length === 0) return;
      const newActive = Math.max(0, Math.min(maxMobileProgress, Math.round(p)));
      if (newActive !== mobileActiveDotIndex) {
        mobileActiveDotIndex = newActive;
        mobileDots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === mobileActiveDotIndex);
        });
      }
    }

    function applyMobileTransforms(p) {
      if (deckCards.length === 0) return;

      deckCards.forEach((panel, i) => {
        const rel = p - i;
        const maxLift = Math.min(50, Math.round((panel.offsetHeight || 380) * 0.12) || 40);

        if (rel >= 0) {
          if (rel >= 1.0) {
            panel.style.transform = `translate3d(0, -${maxLift}px, 0) scale(0.88)`;
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.pointerEvents = 'none';
            panel.style.zIndex = '1';
          } else {
            const t = rel;
            const scale = 1.0 - t * 0.12;
            const translateY = -t * maxLift;
            const opacity = Math.max(0, 1.0 - t * 1.3);

            panel.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
            panel.style.opacity = opacity.toFixed(3);
            panel.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
            panel.style.pointerEvents = rel < 0.25 ? 'auto' : 'none';
            panel.style.zIndex = String(10 + i);
          }
        } else {
          if (rel <= -1.0) {
            panel.style.transform = 'translate3d(0, 32%, 0) scale(0.96)';
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.pointerEvents = 'none';
            panel.style.zIndex = '1';
          } else {
            const enter = 1.0 + rel;
            const translateYPercent = (1.0 - enter) * 32;
            const scale = 0.96 + enter * 0.04;
            const opacity = Math.min(1.0, enter * 1.8);

            panel.style.transform = `translate3d(0, ${translateYPercent.toFixed(2)}%, 0) scale(${scale.toFixed(3)})`;
            panel.style.opacity = opacity.toFixed(3);
            panel.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
            panel.style.pointerEvents = enter > 0.75 ? 'auto' : 'none';
            panel.style.zIndex = String(10 + i);
          }
        }
      });

      updateMobileDots(p);
    }

    function renderMobileLoop() {
      const diff = mobileTargetProgress - mobileCurrentProgress;

      if (Math.abs(diff) > 0.0004) {
        mobileCurrentProgress += diff * 0.11;
        applyMobileTransforms(mobileCurrentProgress);
        requestAnimationFrame(renderMobileLoop);
      } else {
        mobileCurrentProgress = mobileTargetProgress;
        applyMobileTransforms(mobileCurrentProgress);
        mobileIsAnimating = false;
      }
    }

    function wakeMobileAnimation() {
      if (!mobileIsAnimating) {
        mobileIsAnimating = true;
        requestAnimationFrame(renderMobileLoop);
      }
    }

    function onMobileScroll() {
      if (window.innerWidth > 992) return;
      mobileTargetProgress = computeMobileProgress();
      wakeMobileAnimation();
    }

    function scrollToMobileCard(cardIndex) {
      if (!mobileScrollWrapper) return;
      const scrollDistance = mobileScrollWrapper.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) return;
      const wrapperTop = window.pageYOffset + mobileScrollWrapper.getBoundingClientRect().top;
      const targetScroll = wrapperTop + (cardIndex / maxMobileProgress) * scrollDistance;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    // Dots navigation click
    mobileDots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        mobileTargetProgress = idx;
        wakeMobileAnimation();
        scrollToMobileCard(idx);
      });
    });

    // Touch swipe support (swipe left -> next, swipe right -> previous)
    let touchStartX = 0;
    let touchStartY = 0;

    if (mobileScrollWrapper) {
      mobileScrollWrapper.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      mobileScrollWrapper.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const diffX = touchStartX - e.changedTouches[0].clientX;
        const diffY = touchStartY - e.changedTouches[0].clientY;

        if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
          if (diffX > 0 && mobileTargetProgress < maxMobileProgress) {
            const nextStage = Math.min(maxMobileProgress, Math.round(mobileTargetProgress + 1));
            mobileTargetProgress = nextStage;
            wakeMobileAnimation();
            scrollToMobileCard(nextStage);
          } else if (diffX < 0 && mobileTargetProgress > 0) {
            const prevStage = Math.max(0, Math.round(mobileTargetProgress - 1));
            mobileTargetProgress = prevStage;
            wakeMobileAnimation();
            scrollToMobileCard(prevStage);
          }
        }
      }, { passive: true });
    }


    /* ==========================================================================
       3. Global Unified Window Listeners & Initializers
       ========================================================================== */
    function onWindowScroll() {
      if (window.innerWidth > 992) {
        onDesktopScroll();
      } else {
        onMobileScroll();
      }
    }

    function onWindowResize() {
      if (window.innerWidth > 992) {
        if (desktopCurrentIndex >= 0) {
          changeDesktopImage(desktopCurrentIndex);
        }
        updateDesktopActiveStep();
      } else {
        mobileTargetProgress = computeMobileProgress();
        wakeMobileAnimation();
      }
    }

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    window.addEventListener('resize', onWindowResize, { passive: true });

    // Initial activation
    if (window.innerWidth > 992) {
      updateDesktopActiveStep();
    } else {
      mobileCurrentProgress = 0;
      mobileTargetProgress = computeMobileProgress();
      applyMobileTransforms(0);
      wakeMobileAnimation();
    }

  });
})();
