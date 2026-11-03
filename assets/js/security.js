/**
 * Security Section Controller
 *
 * 1. Desktop Mode (> 992px):
 *    - Left image viewer stays sticky and full viewport height & width.
 *    - Right text sections scroll smoothly and lock into fixed centered positions.
 *    - When the user scrolls (mouse wheel, trackpad, touch, or arrow keys),
 *      the next text heading/step automatically glides to the exact fixed position.
 *    - Left image slides synchronously with the text transition.
 *    - When on the last step (Step 06), if the user attempts to scroll down,
 *      it smoothly transitions directly to the next section (#proves).
 *    - Active text section is highlighted, passed steps marked.
 *    - Clicking any text step smoothly scrolls directly to it.
 *
 * 2. Mobile Mode (<= 992px):
 *    - Ultra-smooth continuous card deck slide & size reduction engine.
 *    - Each card displays Image first (top), then Content (bottom).
 *    - Swipe left on last card smoothly proceeds to next section.
 *    - Physics-based LERP interpolation on requestAnimationFrame (60/120fps).
 *    - Touch swipe gestures & interactive pagination dots.
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Desktop Synchronized Sticky Scroll Controller (> 992px)
       ========================================================================== */
    const showcase = document.querySelector('.security-sticky-showcase');
    const track = document.getElementById('securityImageTrack');
    const imageFrame = document.querySelector('.security-image-frame');
    const steps = Array.from(document.querySelectorAll('.security-text-step'));
    const nextSection = document.getElementById('proves') || document.querySelector('.proves-section');
    const secHeader = document.querySelector('.security-header') || document.getElementById('security');

    let desktopCurrentIndex = 0;
    let isLocked = false;
    let isAutoScrolling = false;
    let scrollAnimationId = null;
    let scrollEndTimer = null;

    function getImageHeight() {
      return imageFrame ? imageFrame.clientHeight : window.innerHeight;
    }

    function changeDesktopImage(index) {
      if (!track || !imageFrame) return;
      const imageHeight = getImageHeight();
      track.style.transform = `translate3d(0, -${index * imageHeight}px, 0)`;
    }

    function setStepActive(index) {
      if (index < 0 || index >= steps.length) return;
      desktopCurrentIndex = index;
      steps.forEach((step, idx) => {
        step.classList.toggle('active', idx === index);
        step.classList.toggle('passed', idx < index);
      });
      changeDesktopImage(index);
    }

    function getStepScrollY(index) {
      if (index < 0 || index >= steps.length) return 0;
      const step = steps[index];
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const rect = step.getBoundingClientRect();
      const stepCenter = rect.top + (step.offsetHeight || window.innerHeight) / 2;
      const viewportCenter = window.innerHeight / 2;
      return currentScrollY + (stepCenter - viewportCenter);
    }

    // Perlin's Smootherstep: zero acceleration & zero jerk at endpoints for velvety glide
    function smootherstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function smoothScrollTo(targetY, duration = 520, callback) {
      if (scrollAnimationId) {
        cancelAnimationFrame(scrollAnimationId);
        scrollAnimationId = null;
      }

      const startY = window.pageYOffset || document.documentElement.scrollTop;
      const distance = targetY - startY;

      if (Math.abs(distance) < 1.5) {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, targetY);
        document.documentElement.style.scrollBehavior = '';
        isAutoScrolling = false;
        if (callback) callback();
        return;
      }

      isAutoScrolling = true;
      // Temporarily disable global CSS smooth-scroll so it doesn't fight RAF
      document.documentElement.style.scrollBehavior = 'auto';
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = smootherstep(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          scrollAnimationId = requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetY);
          scrollAnimationId = null;
          isAutoScrolling = false;
          document.documentElement.style.scrollBehavior = '';
          if (callback) callback();
        }
      }

      scrollAnimationId = requestAnimationFrame(step);
    }

    function goToStep(index) {
      if (index < 0) index = 0;
      if (index >= steps.length) index = steps.length - 1;
      setStepActive(index);
      isLocked = true;
      const targetY = getStepScrollY(index);
      smoothScrollTo(targetY, 520, () => {
        setTimeout(() => {
          isLocked = false;
        }, 90);
      });
    }

    function goToNextSection() {
      if (!nextSection) return;
      isLocked = true;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const nextRect = nextSection.getBoundingClientRect();
      const targetY = currentScrollY + nextRect.top;
      smoothScrollTo(targetY, 600, () => {
        setTimeout(() => {
          isLocked = false;
        }, 120);
      });
    }

    function goToPrevHeader() {
      if (!secHeader) return;
      isLocked = true;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const headerRect = secHeader.getBoundingClientRect();
      const targetY = Math.max(0, currentScrollY + headerRect.top - 20);
      smoothScrollTo(targetY, 520, () => {
        setTimeout(() => {
          isLocked = false;
        }, 90);
      });
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
        setStepActive(desktopCurrentIndex);
      }
    }

    function handleWheel(e) {
      if (window.innerWidth <= 992) return;
      if (!showcase || steps.length === 0) return;

      const showcaseRect = showcase.getBoundingClientRect();
      const inShowcase = showcaseRect.top <= 80 && showcaseRect.bottom >= window.innerHeight - 80;

      if (!inShowcase) return;

      // Filter micro jitter / tiny trackpad noise
      if (Math.abs(e.deltaY) < 18) {
        if (isLocked || isAutoScrolling) e.preventDefault();
        return;
      }

      // If currently animating or locked, absorb event cleanly without extending lock
      if (isLocked || isAutoScrolling) {
        e.preventDefault();
        return;
      }

      if (!isAutoScrolling) {
        updateDesktopActiveStep();
      }

      const scrollingDown = e.deltaY > 0;

      if (scrollingDown) {
        if (desktopCurrentIndex < steps.length - 1) {
          e.preventDefault();
          goToStep(desktopCurrentIndex + 1);
        } else if (desktopCurrentIndex === steps.length - 1) {
          // Last text reached! User tries to scroll -> smooth glide to next section
          e.preventDefault();
          goToNextSection();
        }
      } else { // scrolling up
        if (desktopCurrentIndex > 0) {
          e.preventDefault();
          goToStep(desktopCurrentIndex - 1);
        } else if (desktopCurrentIndex === 0) {
          if (showcaseRect.top < -30) {
            e.preventDefault();
            goToPrevHeader();
          }
        }
      }
    }

    function handleKeyDown(e) {
      if (window.innerWidth <= 992) return;
      if (!showcase || steps.length === 0) return;

      const showcaseRect = showcase.getBoundingClientRect();
      const inShowcase = showcaseRect.top <= 80 && showcaseRect.bottom >= window.innerHeight - 80;
      if (!inShowcase) return;

      if (isLocked || isAutoScrolling) {
        if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', ' '].includes(e.key)) {
          e.preventDefault();
        }
        return;
      }

      if (!isAutoScrolling) {
        updateDesktopActiveStep();
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        if (desktopCurrentIndex < steps.length - 1) {
          e.preventDefault();
          goToStep(desktopCurrentIndex + 1);
        } else if (desktopCurrentIndex === steps.length - 1) {
          e.preventDefault();
          goToNextSection();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        if (desktopCurrentIndex > 0) {
          e.preventDefault();
          goToStep(desktopCurrentIndex - 1);
        } else if (desktopCurrentIndex === 0) {
          if (showcaseRect.top < -30) {
            e.preventDefault();
            goToPrevHeader();
          }
        }
      }
    }

    let desktopTouchStartY = 0;
    let desktopTouchStartX = 0;

    if (showcase) {
      showcase.addEventListener('touchstart', (e) => {
        if (window.innerWidth <= 992) return;
        if (e.touches && e.touches.length > 0) {
          desktopTouchStartY = e.touches[0].clientY;
          desktopTouchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      showcase.addEventListener('touchend', (e) => {
        if (window.innerWidth <= 992) return;
        if (!e.changedTouches || e.changedTouches.length === 0) return;

        const showcaseRect = showcase.getBoundingClientRect();
        const inShowcase = showcaseRect.top <= 80 && showcaseRect.bottom >= window.innerHeight - 80;
        if (!inShowcase) return;

        const diffY = desktopTouchStartY - e.changedTouches[0].clientY;
        const diffX = desktopTouchStartX - e.changedTouches[0].clientX;

        if (Math.abs(diffY) > 35 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
          if (isLocked || isAutoScrolling) return;

          if (!isAutoScrolling) {
            updateDesktopActiveStep();
          }

          if (diffY > 0) { // Swipe up = scroll down
            if (desktopCurrentIndex < steps.length - 1) {
              goToStep(desktopCurrentIndex + 1);
            } else if (desktopCurrentIndex === steps.length - 1) {
              goToNextSection();
            }
          } else { // Swipe down = scroll up
            if (desktopCurrentIndex > 0) {
              goToStep(desktopCurrentIndex - 1);
            } else if (desktopCurrentIndex === 0) {
              if (showcaseRect.top < -30) {
                goToPrevHeader();
              }
            }
          }
        }
      }, { passive: true });
    }

    function onDesktopScroll() {
      if (window.innerWidth <= 992) return;

      if (!isAutoScrolling) {
        updateDesktopActiveStep();
      }
    }

    steps.forEach((step, idx) => {
      step.addEventListener('click', () => {
        if (window.innerWidth > 992) {
          goToStep(idx);
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
        mobileCurrentProgress += diff * 0.18;
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
          if (diffX > 0) {
            if (mobileTargetProgress < maxMobileProgress) {
              const nextStage = Math.min(maxMobileProgress, Math.round(mobileTargetProgress + 1));
              mobileTargetProgress = nextStage;
              wakeMobileAnimation();
              scrollToMobileCard(nextStage);
            } else if (mobileTargetProgress >= maxMobileProgress) {
              // Last card on mobile swipe left -> scroll to next section
              if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
              }
            }
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

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
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
