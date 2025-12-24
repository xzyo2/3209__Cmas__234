let physicsLoopId = null;

export function enablePhysics() {
    const images = Array.from(document.querySelectorAll('.circle-img'));
    const stage = document.getElementById('image-stage');
    
    stage.classList.remove('flying-mode');

    // --- PHYSICS SETTINGS ---
    const DAMPING = 0.95; // Friction
    const RADIUS = 75;    
    const DIAMETER = 150;
    const BOUNCE = 0.7;   
    const MAX_SPEED = 25; // Limit speed to prevent glitching

    if (physicsLoopId) cancelAnimationFrame(physicsLoopId);

    const bodies = images.map(img => {
        img.classList.remove('hidden');
        img.style.animation = 'none';
        img.style.opacity = '1'; 
        img.style.transform = 'translate(0px, 0px) rotate(0deg)';
        img.style.cursor = 'grab';
        
        // Spawn randomly inside screen
        const startX = Math.random() * (window.innerWidth - DIAMETER - 50) + 25;
        const startY = Math.random() * (window.innerHeight - DIAMETER - 50) + 25;

        return {
            el: img,
            x: startX,
            y: startY,
            vx: (Math.random() - 0.5) * 8, 
            vy: (Math.random() - 0.5) * 8,
            rot: Math.random() * 360,
            rotVel: 0,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0
        };
    });

    // --- INPUT HANDLING ---
    bodies.forEach(body => {
        const onStart = (e) => {
            e.preventDefault();
            body.isDragging = true;
            body.el.style.cursor = 'grabbing';
            body.el.style.zIndex = 1000; 
            body.el.style.transition = 'none'; 

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            body.dragOffsetX = clientX - body.x;
            body.dragOffsetY = clientY - body.y;
            body.vx = 0; body.vy = 0; body.rotVel = 0;
        };
        body.el.addEventListener('mousedown', onStart);
        body.el.addEventListener('touchstart', onStart, { passive: false });
    });

    window.addEventListener('mousemove', (e) => handleMove(e));
    window.addEventListener('touchmove', (e) => handleMove(e), { passive: false });
    window.addEventListener('mouseup', () => handleEnd());
    window.addEventListener('touchend', () => handleEnd());

    function handleMove(e) {
        bodies.forEach(body => {
            if (!body.isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            let newX = clientX - body.dragOffsetX;
            let newY = clientY - body.dragOffsetY;

  
            const maxW = window.innerWidth - DIAMETER;
            const maxH = window.innerHeight - DIAMETER;
            if (newX < 0) newX = 0;
            if (newX > maxW) newX = maxW;
            if (newY < 0) newY = 0;
            if (newY > maxH) newY = maxH;

            // Throw Physics
            body.vx = newX - body.x;
            body.vy = newY - body.y;
            
            // Limit Drag Speed
            body.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, body.vx));
            body.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, body.vy));

            body.x = newX;
            body.y = newY;
        });
    }

    function handleEnd() {
        bodies.forEach(body => {
            if (body.isDragging) {
                body.isDragging = false;
                body.el.style.cursor = 'grab';
                body.el.style.zIndex = 100;
                body.rotVel = body.vx * 0.5;
            }
        });
    }

    // --- GAME LOOP ---
    function update() {
        // Pause if hidden
        if (stage.classList.contains('hidden')) {
            physicsLoopId = requestAnimationFrame(update);
            return; 
        }

        const winW = window.innerWidth;
        const winH = window.innerHeight;

        bodies.forEach(body => {
            if (!body.isDragging) {
                body.vx *= DAMPING;
                body.vy *= DAMPING;
                body.rotVel *= DAMPING;

                // Stop tiny movements (Performance)
                if (Math.abs(body.vx) < 0.05) body.vx = 0;
                if (Math.abs(body.vy) < 0.05) body.vy = 0;

                body.x += body.vx;
                body.y += body.vy;
                body.rot += body.rotVel;
            }
        });

        // Resolve Collisions
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                resolveCollision(bodies[i], bodies[j]);
            }
        }

        // HARD CLAMP (Forces them inside screen)
        bodies.forEach(body => {
            const maxX = winW - DIAMETER;
            const maxY = winH - DIAMETER;

            if (body.x < 0) { body.x = 0; body.vx *= -BOUNCE; }
            if (body.x > maxX) { body.x = maxX; body.vx *= -BOUNCE; }
            if (body.y < 0) { body.y = 0; body.vy *= -BOUNCE; }
            if (body.y > maxY) { body.y = maxY; body.vy *= -BOUNCE; }

            // Render using Transform (Much faster than left/top)
            body.el.style.transform = `translate(${body.x}px, ${body.y}px) rotate(${body.rot}deg)`;
        });

        physicsLoopId = requestAnimationFrame(update);
    }

    function resolveCollision(b1, b2) {
        const dx = (b2.x + RADIUS) - (b1.x + RADIUS);
        const dy = (b2.y + RADIUS) - (b1.y + RADIUS);
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < DIAMETER && dist > 0.1) {
            const overlap = DIAMETER - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const moveX = nx * overlap * 0.5;
            const moveY = ny * overlap * 0.5;

            if (!b1.isDragging) { b1.x -= moveX; b1.y -= moveY; }
            if (!b2.isDragging) { b2.x += moveX; b2.y += moveY; }

            const dvx = b1.vx - b2.vx;
            const dvy = b1.vy - b2.vy;
            const p = dvx * nx + dvy * ny;

            if (p > 0) {
                if (!b1.isDragging) { b1.vx -= p * nx; b1.vy -= p * ny; }
                if (!b2.isDragging) { b2.vx += p * nx; b2.vy += p * ny; }
                b1.rotVel += (Math.random() - 0.5) * 5;
                b2.rotVel += (Math.random() - 0.5) * 5;
            }
        }
    }

    physicsLoopId = requestAnimationFrame(update);
}