import { getEl, playSound } from './utils.js';
import { enablePhysics } from './physics.js';

const texts = [
    "Okay good",
    "Today is Christmas, and I'll be celebrating it with you.",
    "Isn't that just fun to think about?",
    "AND THAT'S THE PURPOSE OF THIS WEBSITE",
    "WOOOOOOOOOOOOOOOOOOOOOOOOOOOOOHOOOOOOOOOOOOOOOOOOOOOOOOO!!",
    "The first time I met you, I was so happy.",
    "Honestly, I consider myself lucky because I'll be celebrating with you.",
    "The one I prayed for.",
    "It might not be years since we met, but it already feels like a lifetime.",
    "Yanna, my love.",
    "You deserve every single thing in this world.",
    "And I want to give you all of it.",
    "But I can't do it by myself.",
    "So I need you to do it with me and stay by my side.",
    "I wanna make you happy, and I want you to be happy with me.",
    "And so, I'm writing this letter to you.",
    "I want you to know how much I <span id='magic-word'>like</span> you.", // Added SPAN here
    "Are you ready?"
];

const ANIMATION_SPEED = 600; 
let isTransitioning = false; 

function animateContentChange(mutationFn) {
    const wrapper = document.querySelector('.content-wrapper');
    const startW = wrapper.offsetWidth;
    const startH = wrapper.offsetHeight;

    // 1. Lock Size
    wrapper.style.width = startW + 'px';
    wrapper.style.height = startH + 'px';
    wrapper.style.transition = 'none'; // Disable transition for instant measurement

    // 2. Change Content
    mutationFn();

    // 3. Measure New Size
    wrapper.style.width = 'auto';
    wrapper.style.height = 'auto';
    const targetW = wrapper.offsetWidth;
    const targetH = wrapper.offsetHeight;

    // 4. Snap back to Old Size
    wrapper.style.width = startW + 'px';
    wrapper.style.height = startH + 'px';
    wrapper.offsetHeight; // Force Reflow

    // 5. Animate to New Size
    wrapper.style.transition = `width ${ANIMATION_SPEED}ms cubic-bezier(0.25, 0.8, 0.25, 1), height ${ANIMATION_SPEED}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
    wrapper.style.width = targetW + 'px';
    wrapper.style.height = targetH + 'px';

    // 6. Cleanup
    setTimeout(() => {
        wrapper.style.width = 'auto';
        wrapper.style.height = 'auto';
        wrapper.style.transition = ''; 
    }, ANIMATION_SPEED);
}

function updateText(text, callback) {
    const h2 = getEl('main-text');
    
    // 1. Start Fade Out
    h2.classList.add('transparent');

    // 2. Wait 500ms for Fade Out to finish
    setTimeout(() => {
        
        // 3. Swap Text & Resize Box (While invisible)
        animateContentChange(() => {
            h2.innerHTML = text; // innerHTML allows the <span> tag
        });

        // 4. Wait for Box Resize to mostly finish, then Fade In
        setTimeout(() => {
            h2.classList.remove('transparent');
            
            // --- FLICKER LOGIC (Like -> Love) ---
            const magicWord = document.getElementById('magic-word');
            if (magicWord) {
                setTimeout(() => {
                    magicWord.classList.add('glitch-effect');
                    let flickerCount = 0;
                    
                    const interval = setInterval(() => {
                        flickerCount++;
                        // Randomly swap text and opacity
                        magicWord.innerText = (Math.random() > 0.5) ? "LIKE" : "LOVE";
                        magicWord.style.opacity = (Math.random() > 0.5) ? "1" : "0.5";

                        // Finish
                        if (flickerCount >= 15) {
                            clearInterval(interval);
                            magicWord.innerText = "LOVE";
                            magicWord.style.opacity = "1";
                            magicWord.classList.remove('glitch-effect');
                            
                            // Final Pop Style
                            magicWord.style.color = "#ff4d4d";
                            magicWord.style.fontWeight = "900";
                            magicWord.style.transform = "scale(1.5)";
                            magicWord.style.textShadow = "0 0 15px rgba(255, 77, 77, 0.8)";
                            magicWord.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                        }
                    }, 50); // 50ms speed
                }, 1000); // Wait 1s before starting flicker
            }
            // ------------------------------------

            if (callback) callback();
        }, ANIMATION_SPEED - 100); // Fade in slightly before resize ends for smoothness

    }, 500); // Matches CSS transition time
}

export function startScenario() {
    const cdSection = getEl('countdown-section');
    const storySection = getEl('story-section');
    const imageStage = getEl('image-stage');
    
    cdSection.classList.add('hidden');
    storySection.classList.remove('hidden'); 
    
    playSound('audio-santa');
    
    imageStage.classList.add('flying-mode');
    getEl('img1').classList.remove('hidden');
    getEl('img2').classList.remove('hidden');
    getEl('img3').classList.remove('hidden');

    setTimeout(() => {
        getEl('img1').classList.add('hidden');
        getEl('img2').classList.add('hidden');
        getEl('img3').classList.add('hidden');

        updateText("Let's start with the classic wave to earth music, shall we?");
        
        setTimeout(() => {
            playSound('audio-bad');
            startButtonsLogic();
        }, 1200); 
    }, 4000); 
}

function startButtonsLogic() {
    setTimeout(() => {
        updateText("Good enough?");
        
        setTimeout(() => {
            const btnGroup = getEl('button-group');
            animateContentChange(() => { btnGroup.classList.remove('hidden'); });
            
            // Allow layout to settle before fading in
            setTimeout(() => {
                btnGroup.classList.add('transparent');
                // Force reflow
                btnGroup.offsetHeight;
                btnGroup.classList.remove('transparent');
                btnGroup.style.transition = 'opacity 0.5s';
                btnGroup.style.opacity = '1';
            }, 50);
            
        }, 800);

        const btnNo = getEl('btn-no');
        const btnYes = getEl('btn-yes');
        let noClicks = 0;

        btnNo.onclick = () => {
            noClicks++;
            if (noClicks === 1) {
                btnNo.classList.add('shake-anim');
                setTimeout(() => btnNo.classList.remove('shake-anim'), 400);
            } else if (noClicks === 2) {
                btnNo.style.order = -1;
            } else if (noClicks === 3) {
                btnNo.innerText = "Yes";
                btnNo.onclick = proceedToTextSaga;
            }
        };
        btnYes.onclick = proceedToTextSaga;
    }, 2500);
}

function proceedToTextSaga() {
    const btnGroup = getEl('button-group');
    const overlay = getEl('click-overlay');
    
    // Fade out buttons
    btnGroup.style.opacity = '0';
    setTimeout(() => {
        animateContentChange(() => { btnGroup.classList.add('hidden'); });
    }, 500);

    setTimeout(() => {
        isTransitioning = false; 
        updateText("Click anywhere to proceed", () => {
            overlay.classList.remove('hidden');
        });
    }, 800); 

    let textIndex = 0;
    
    overlay.onclick = () => {
        if (isTransitioning) return;
        isTransitioning = true; 
        
        if (textIndex < texts.length) {
            updateText(texts[textIndex], () => {
                setTimeout(() => { isTransitioning = false; }, 200); 
            });
            textIndex++;
        } else {
            startPhysicsPhase();
        }
    };
}

export function startPhysicsPhase() {
    const h2 = getEl('main-text');
    const overlay = getEl('click-overlay');
    const frame = getEl('letter-frame');
    const contentWrapper = document.querySelector('.content-wrapper');
    const toggleBtn = getEl('toggle-stickers');
    const imageStage = getEl('image-stage');
    
    h2.classList.add('transparent');
    overlay.classList.add('hidden');
    
    setTimeout(() => {
        contentWrapper.style.transition = 'opacity 0.5s';
        contentWrapper.style.opacity = '0'; 
        contentWrapper.style.pointerEvents = 'none';

        const yourLetter = `
Dear Yanna,
<br>
I'm elated to say that my greatest twist of the year is spending this New Year and Christmas with you. It's such a change from the earlier days when I would just stare at you in silence. I didn't think I would be celebrating Christmas and New Year's with you. It's hard to express the gratitude I have towards God for this blessing. But the best way to begin is to make sure I always keep you happy.
<br>
<br>
In the very beginning, it was not out of sheer necessity that I decided to start a relationship with you. From the very beginning, I just wanted to. I have always felt that you are preceded with the smile that brings me eternal joy. You understand me in a way that is effortless, yet I feel so understood. There's no need to make an effort to change yourself for me, because the way that you are is already more than more than enough. 
<br>
<br>
Yanna, it makes me happy to spend all this time with you. I hope you understand that I picked you for a reason, and I still do. Loving you, I guess you could say, is something that would come easily to anybody, like the act of just breathing. Even though I still have a lot to learn about you, I know with confidence that I would be able to handle you. You deserve all the wonderful things this world has to offer, and that all begins with you having me. Merry Christmas! Enjoy the stimtichers on your screen, and maybe maltitos too!
<br>
<br>
Love,
<br>
Adi
        `;

        frame.innerHTML = `<p class="letter-content">${yourLetter}</p>`;

        frame.classList.remove('hidden');
        frame.offsetHeight; 
        frame.classList.add('visible');

        toggleBtn.classList.remove('hidden');
        toggleBtn.classList.add('active-pink');
        toggleBtn.innerText = "Hide Stickers";

        toggleBtn.onclick = () => {
            const isCurrentlyOn = !imageStage.classList.contains('hidden');
            if (isCurrentlyOn) {
                imageStage.classList.add('hidden');
                toggleBtn.classList.remove('active-pink');
                toggleBtn.classList.add('inactive-glass');
                toggleBtn.innerText = "Show Stickers";
            } else {
                imageStage.classList.remove('hidden');
                toggleBtn.classList.remove('inactive-glass');
                toggleBtn.classList.add('active-pink');
                toggleBtn.innerText = "Hide Stickers";
            }
        };

        enablePhysics();
    }, 1000);
}