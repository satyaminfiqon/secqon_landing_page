/**
 * Pricing Section Billing Cycle Toggle
 * Handles monthly vs annual pricing switch with smooth transitions.
 */
document.addEventListener('DOMContentLoaded', () => {
  const billingToggle = document.getElementById('billingToggle');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelAnnual = document.getElementById('labelAnnual');
  const priceElements = document.querySelectorAll('.plan-price-amount[data-monthly]');

  if (!billingToggle) return;

  function setBillingCycle(isAnnual) {
    billingToggle.setAttribute('aria-checked', isAnnual ? 'true' : 'false');
    
    if (labelMonthly && labelAnnual) {
      if (isAnnual) {
        labelMonthly.classList.remove('active');
        labelAnnual.classList.add('active');
      } else {
        labelMonthly.classList.add('active');
        labelAnnual.classList.remove('active');
      }
    }

    priceElements.forEach(priceEl => {
      const monthlyPrice = priceEl.getAttribute('data-monthly');
      const annualPrice = priceEl.getAttribute('data-annual');
      
      // Gentle fade effect during price update
      priceEl.style.opacity = '0';
      setTimeout(() => {
        priceEl.textContent = isAnnual ? annualPrice : monthlyPrice;
        priceEl.style.opacity = '1';
      }, 120);
    });
  }

  // Click on switch button
  billingToggle.addEventListener('click', () => {
    const isAnnual = billingToggle.getAttribute('aria-checked') === 'true';
    setBillingCycle(!isAnnual);
  });

  // Click on Monthly label
  if (labelMonthly) {
    labelMonthly.addEventListener('click', () => {
      setBillingCycle(false);
    });
  }

  // Click on Annual label
  if (labelAnnual) {
    labelAnnual.addEventListener('click', () => {
      setBillingCycle(true);
    });
  }
});

