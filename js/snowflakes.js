export function initSnow() {
    const container = document.getElementById('snow-container');
    const snowCount = 50;

    for (let i = 0; i < snowCount; i++) {
        const snow = document.createElement('div');
        snow.style.position = 'absolute';
        snow.style.width = Math.random() * 5 + 2 + 'px';
        snow.style.height = snow.style.width;
        snow.style.background = 'white';
        snow.style.borderRadius = '50%';
        snow.style.opacity = Math.random() * 0.7 + 0.3;
        snow.style.left = Math.random() * 100 + 'vw';
        snow.style.top = -10 + 'px';
        snow.style.animation = `fall ${Math.random() * 5 + 5}s linear infinite`;
        snow.style.animationDelay = -Math.random() * 10 + 's';
        
        container.appendChild(snow);
    }

    // Dynamic style injection for fall animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fall {
            to { transform: translateY(110vh); }
        }
    `;
    document.head.appendChild(style);
}