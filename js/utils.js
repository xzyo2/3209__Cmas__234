export const getEl = (id) => document.getElementById(id);

export const playSound = (id) => {
    const audio = getEl(id);
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio prevented:", e));
    }
};

export const getRandomPos = (w, h) => {
    return {
        x: Math.random() * (window.innerWidth - w),
        y: Math.random() * (window.innerHeight - h)
    };
};