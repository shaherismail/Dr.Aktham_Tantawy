// Confetti visual effect generator
export function fireConfettiEffect() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#0D6EFD', '#4DA3FF', '#22C55E', '#FBBF24', '#F43F5E', '#8B5CF6'];

    const interval = setInterval(() => {
        if (Date.now() > animationEnd) {
            return clearInterval(interval);
        }

        if (typeof confetti === 'function') {
            confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: colors
            });
        }
    }, 200);
}
