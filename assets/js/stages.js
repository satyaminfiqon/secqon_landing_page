/**
 * Stages Section Scroll & Animation Controller
 * Ultra-smooth continuous card deck slide & size reduction engine.
 * - Current card reduces in size (scale 1.0 -> 0.76) and moves upward (0px -> -90px).
 * - Next card glides upward from below (100% -> 0%) and expands into full size.
 * - Physics-based LERP interpolation on requestAnimationFrame for silky 60/120fps motion.
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const scrollWrapper = document.querySelector('.stages-scroll-wrapper');
    const stagePanels = Array.from(document.querySelectorAll('.stage-panel'));

    if (!scrollWrapper || stagePanels.length === 0) return;

    const totalStages = stagePanels.length;
    const maxProgress = totalStages - 1;

    let targetProgress = 0;   // Target progress: 0.0 to 3.0
    let currentProgress = 0;  // Smoothly interpolated progress
    let isAnimating = false;

    // S-curve with smooth acceleration and deceleration
    function smootherstep(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    // Map scroll distance to stage progress with resting plateaus
    function computeTargetProgress() {
      const rect = scrollWrapper.getBoundingClientRect();
      const scrollDistance = scrollWrapper.offsetHeight - window.innerHeight;

      if (scrollDistance <= 50) return targetProgress;

      const scrolled = -rect.top;
      const linearProgress = Math.max(0, Math.min(1, scrolled / scrollDistance));

      // Divide into intervals with smoothstep easing between cards
      const rawP = linearProgress * maxProgress;
      const stage = Math.floor(rawP);
      const frac = rawP - stage;

      if (stage >= maxProgress) {
        return maxProgress;
      }

      // Eased fraction provides a resting zone on each card and smooth transition
      const easedFrac = smootherstep(frac);
      return stage + easedFrac;
    }

    // Apply exact 3D transforms & opacities based on smooth progress
    function applyTransforms(p) {
      stagePanels.forEach((panel, i) => {
        const rel = p - i;

        if (rel >= 0) {
          // Card i is currently in view or has been scrolled past (exiting/passed)
          if (rel >= 1.0) {
            // Completely passed
            panel.style.transform = 'translate3d(0, -90px, 0) scale(0.76)';
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.pointerEvents = 'none';
            panel.style.zIndex = '1';
          } else {
            // In active view or smoothly shrinking & lifting (rel from 0.0 to 1.0)
            const t = rel;
            const scale = 1.0 - t * 0.24; // Visibly reduces size down to 0.76!
            const translateY = -t * 90;   // Moves upward by 90px
            const opacity = Math.max(0, 1.0 - t * 1.15); // Smooth fade out

            panel.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
            panel.style.opacity = opacity.toFixed(3);
            panel.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
            panel.style.pointerEvents = rel < 0.25 ? 'auto' : 'none';
            panel.style.zIndex = String(10 + i);
          }
        } else {
          // rel < 0: Card is entering from below or waiting
          if (rel <= -1.0) {
            // Waiting completely below
            panel.style.transform = 'translate3d(0, 100%, 0) scale(0.95)';
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.pointerEvents = 'none';
            panel.style.zIndex = '1';
          } else {
            // Entering upward from below (rel from -1.0 to 0.0)
            const enter = 1.0 + rel; // 0.0 to 1.0
            const translateYPercent = (1.0 - enter) * 100;
            const scale = 0.94 + enter * 0.06; // Expands from 0.94 up to 1.0
            const opacity = Math.min(1.0, enter * 1.5);

            panel.style.transform = `translate3d(0, ${translateYPercent.toFixed(2)}%, 0) scale(${scale.toFixed(3)})`;
            panel.style.opacity = opacity.toFixed(3);
            panel.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
            panel.style.pointerEvents = enter > 0.75 ? 'auto' : 'none';
            panel.style.zIndex = String(10 + i);
          }
        }
      });
    }

    // Animation LERP loop (runs smoothly on requestAnimationFrame)
    function renderLoop() {
      const diff = targetProgress - currentProgress;

      if (Math.abs(diff) > 0.0004) {
        // High quality damping factor for buttery responsiveness
        currentProgress += diff * 0.11;
        applyTransforms(currentProgress);
        requestAnimationFrame(renderLoop);
      } else {
        currentProgress = targetProgress;
        applyTransforms(currentProgress);
        isAnimating = false; // Sleep when settled to save CPU
      }
    }

    function wakeAnimation() {
      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(renderLoop);
      }
    }

    function onScroll() {
      targetProgress = computeTargetProgress();
      wakeAnimation();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Touch swipe support for mobile
    let touchStartY = 0;
    scrollWrapper.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    scrollWrapper.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (Math.abs(diffY) > 40) {
        if (diffY > 0 && targetProgress < maxProgress) {
          targetProgress = Math.min(maxProgress, Math.floor(targetProgress + 1));
          wakeAnimation();
        } else if (diffY < 0 && targetProgress > 0) {
          targetProgress = Math.max(0, Math.ceil(targetProgress - 1));
          wakeAnimation();
        }
      }
    }, { passive: true });

    // Initial render
    currentProgress = 0;
    targetProgress = computeTargetProgress();
    applyTransforms(0);
    wakeAnimation();
  });
})();
