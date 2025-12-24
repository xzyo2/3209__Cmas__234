import { initSnow } from './snowflakes.js';
import { startCountdown } from './countdown.js';
import { startScenario } from './scenario.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Start Snow immediately
    initSnow();

    // 2. Start Countdown immediately (No tap required)
    startCountdown(() => {
        // Callback when countdown hits 0
        startScenario();
    });
});