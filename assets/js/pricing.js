import { supabaseClient } from './app.js';

// Default fallback configuration
let pricingConfig = {
    basePrices: {
        metal: 4500,
        ceramic: 6500,
        clear: 12000,
        general: 200
    },
    installmentInterest: {
        "6": 0,
        "12": 0.04,
        "18": 0.08
    }
};

function fetchPricingConfig() {
    if (!supabaseClient) return Promise.resolve();
    return supabaseClient.from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'pricing_config')
        .single()
        .then(({ data, error }) => {
            if (!error && data && data.setting_value) {
                pricingConfig = data.setting_value;
            }
        });
}

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
        const baseCost = pricingConfig.basePrices[packageKey] || 4500;
        
        // Add subtle interest rate for installments from config
        const interestRate = pricingConfig.installmentInterest[months.toString()] !== undefined 
            ? pricingConfig.installmentInterest[months.toString()]
            : (months > 12 ? 0.08 : (months > 6 ? 0.04 : 0));
            
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
                const packageKey = priceEl.dataset.package || 'clear';
                const baseVal = pricingConfig.basePrices[packageKey] || parseInt(priceEl.dataset.basePrice) || 4500;
                if (isInstallment) {
                    // Divide base cost by 12 installments with 5% rate
                    const installmentVal = Math.round((baseVal * 1.05) / 12);
                    priceEl.innerHTML = `${installmentVal} <span>ريال / شهرياً</span>`;
                } else {
                    priceEl.innerHTML = `${baseVal} <span>ريال</span>`;
                }
            });
        });
    }

    recalculateInstallment();
}

// Auto-run if element is on screen
document.addEventListener('DOMContentLoaded', () => {
    fetchPricingConfig().then(() => {
        initPricingCalculator();
    });
});

