/**
 * Security Section Synchronized Sticky Scroll Controller
 * - Left image frame is fixed / sticky.
 * - Right text content items scroll through the viewport.
 * - When a new text item reaches the center of the display,
 *   the image track scrolls up/down to show that section's image!
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('securityImageTrack');
    const steps = Array.from(document.querySelectorAll('.security-text-step'));

    if (!track || steps.length === 0) return;

    let currentIndex = 0;
    let isTicking = false;

    function updateActiveStep() {
      const triggerY = window.innerHeight * 0.5; // Active trigger zone in middle of screen
      let activeIndex = 0;
      let minDistance = Infinity;

      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height * 0.5;
        const distance = Math.abs(stepCenter - triggerY);

        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      if (activeIndex !== currentIndex) {
        currentIndex = activeIndex;

        // 1. Update active highlight on text steps
        steps.forEach((step, i) => {
          if (i === currentIndex) {
            step.classList.add('active');
          } else {
            step.classList.remove('active');
          }
        });

        // 2. Scroll the image track up to reveal that section's image
        track.style.transform = `translateY(-${currentIndex * 100}%)`;
      }

      isTicking = false;
    }

    function onScroll() {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateActiveStep);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Allow clicking on a step to scroll straight to it
    steps.forEach((step) => {
      step.addEventListener('click', () => {
        step.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    // Initial activation
    updateActiveStep();
  });
})();
