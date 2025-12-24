import { getEl, playSound } from './utils.js';

export function startCountdown(onComplete) {
    const timerEl = getEl('timer');
    const phText = getEl('timer-placeholder');
    
    // Placeholder text logic
    const messages = ["Is it time yet?", "Check your watch...", "Almost there...", "Just a little longer..."];
    let msgIndex = 0;
    
    setInterval(() => {
        phText.style.opacity = 0;
        setTimeout(() => {
            phText.innerText = messages[msgIndex];
            phText.style.opacity = 1;
            msgIndex = (msgIndex + 1) % messages.length;
        }, 1000);
    }, 15000);

    // TARGET DATE: Dec 25, 2025 (Adjust this for testing if needed)
    const targetDate = new Date("December 25, 2025 00:00:00 GMT+0800").getTime();

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Calculate time
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Formatting
        timerEl.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Effects
        if (distance < 10000 && distance > 0) {
            if (seconds % 2 === 0) {
                timerEl.className = 'red';
            } else {
                timerEl.className = 'white';
            }
        }

        if (distance < 4000 && distance > 3000) {
             playSound('audio-bells');
        }

        if (distance < 0) {
            clearInterval(interval);
            timerEl.innerText = "00:00:00";
            onComplete();
        }
    }, 1000);

    // ============================================
    // 👇 THIS IS THE DEBUG BACKDOOR 👇
    // ============================================
    window.skipWait = () => {
        clearInterval(interval);        // Stop the background timer
        timerEl.innerText = "00:00:00"; // Set visual to 0
        console.log("Skipping timer... 🚀");
        onComplete();                   // Trigger the next scene
    };
}