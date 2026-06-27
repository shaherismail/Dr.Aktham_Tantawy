import { AppState } from './app.js';

// Pricing Packages & Installments calculations
export function initPricingCalculator() {
    const termRange = document.getElementById('installmentTerms');
    const termLabel = document.getElementById('termValue');
    const packageSelect = document.getElementById('calcPackage');
    
    const monthlyResult = document.getElementById('monthlyPaymentResult');
    const totalResult = document.getElementById('totalCostResult');
    const togglePricing = document.querySelector('.pricing-toggle');

    if (!termRange || !packageSelect) return;

    const recalculateInstallment = () => {
        const packageKey = packageSelect.value;
        const months = parseInt(termRange.value);
        const baseCost = AppState.pricing.basePrices[packageKey];
        
        // Add subtle interest rate for installments
        const interestRate = months > 12 ? 0.08 : (months > 6 ? 0.04 : 0);
        const totalCost = baseCost * (1 + interestRate);
        const monthlyCost = totalCost / months;

        termLabel.textContent = `${months} شهر`;
        monthlyResult.textContent = `${Math.round(monthlyCost)} ريال`;
        totalResult.textContent = `${Math.round(totalCost)} ريال`;
    };

    termRange.addEventListener('input', recalculateInstallment);
    packageSelect.addEventListener('change', recalculateInstallment);

    // Installments display toggle
    if (togglePricing) {
        togglePricing.addEventListener('click', () => {
            togglePricing.classList.toggle('active');
            const prices = document.querySelectorAll('.pricing-price');
            const isInstallment = togglePricing.classList.contains('active');

            prices.forEach(priceEl => {
                const baseVal = parseInt(priceEl.dataset.basePrice);
                if (isInstallment) {
                    // Divide base cost by 12 installments
                    const installmentVal = Math.round((baseVal * 1.05) / 12);
                    priceEl.innerHTML = `${installmentVal} <span>ريال / شهرياً</span>`;
                } else {
                    priceEl.innerHTML = `${baseVal} <span>ريال</span>`;
                }
            });
        });
    }

    recalculateInstallment(); // Call initially
}

// Auto-run if element is on screen
document.addEventListener('DOMContentLoaded', () => {
    initPricingCalculator();
});
