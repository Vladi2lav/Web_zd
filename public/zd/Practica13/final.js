function initFinalPhase() {
    // 1. Find the equals button
    const equalsBtn = document.getElementById('equals');
    if (equalsBtn) {
        // Disappear animation
        equalsBtn.classList.add('fade-out');

        // 2. Wait 5 seconds
        setTimeout(() => {
            startVoidDefense();
        }, 5000);
    } else {
        // Fallback for debugging
        startVoidDefense();
    }
}

function startVoidDefense() {
    // Create Overlay
    const overlay = document.createElement('div');
    overlay.id = 'void-overlay';
    document.body.appendChild(overlay);

    // Create Core (Visual center)
    const core = document.createElement('div');
    core.id = 'void-core';
    overlay.appendChild(core);

    // Create Cursor Light
    const light = document.createElement('div');
    light.className = 'void-game-cursor';
    overlay.appendChild(light);

    // Track mouse
    document.addEventListener('mousemove', function (e) {
        light.style.left = e.clientX + 'px';
        light.style.top = e.clientY + 'px';
    });

    let gameActive = true;
    let score = 0;
    const requiredScore = 20; // Destroy 20 glitches
    const spawnRate = 500;
    let spawnInterval = null;

    // Instructions (Briefly)
    const title = document.createElement('h1');
    title.style.color = 'white';
    title.style.position = 'absolute';
    title.style.top = '20%';
    title.innerText = 'PROTECT THE CORE';
    title.style.fontFamily = 'monospace';
    overlay.appendChild(title);

    setTimeout(() => title.remove(), 2000);

    // Spawn Glitches
    spawnInterval = setInterval(() => {
        if (!gameActive) return;

        const glitch = document.createElement('div');
        glitch.className = 'glitch-particle';
        glitch.innerText = String.fromCharCode(0x30A0 + Math.random() * 96); // Random Katakana

        // Random Edge Position
        const side = Math.floor(Math.random() * 4);
        let startX, startY;
        if (side === 0) { startX = Math.random() * window.innerWidth; startY = -50; } // Top
        else if (side === 1) { startX = window.innerWidth + 50; startY = Math.random() * window.innerHeight; } // Right
        else if (side === 2) { startX = Math.random() * window.innerWidth; startY = window.innerHeight + 50; } // Bottom
        else { startX = -50; startY = Math.random() * window.innerHeight; } // Left

        glitch.style.left = startX + 'px';
        glitch.style.top = startY + 'px';
        overlay.appendChild(glitch);

        // Move towards center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        let moveInt = setInterval(() => {
            if (!gameActive) { clearInterval(moveInt); return; }

            const rect = glitch.getBoundingClientRect();
            const dx = centerX - rect.left;
            const dy = centerY - rect.top;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Speed increases
            const speed = 3;

            glitch.style.left = (rect.left + (dx / dist) * speed) + 'px';
            glitch.style.top = (rect.top + (dy / dist) * speed) + 'px';

            // Check collision with mouse (Light)
            // Simplified: distance check to mouse cursor
            const mouseX = parseFloat(light.style.left) || 0;
            const mouseY = parseFloat(light.style.top) || 0;
            const distMouse = Math.sqrt((mouseX - rect.left) ** 2 + (mouseY - rect.top) ** 2);

            if (distMouse < 60) {
                // Destroyed!
                score++;
                glitch.remove();
                clearInterval(moveInt);

                // Visual feedback
                if (score >= requiredScore) {
                    gameWin();
                }
            }

            // Check collision with Core (Fail condition? Or just visual?)
            // Let's make it forgiving - infinite lives for now, just must destroy N
            if (dist < 20) {
                glitch.remove();
                clearInterval(moveInt);
                // Shake screen?
                overlay.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
                setTimeout(() => overlay.style.transform = 'none', 50);
            }

        }, 20);

    }, spawnRate);

    function gameWin() {
        gameActive = false;
        clearInterval(spawnInterval);

        // Success Message
        const winTitle = document.createElement('h1');
        winTitle.style.color = '#0ff';
        winTitle.style.zIndex = '10005';
        winTitle.innerText = 'SYSTEM RESTORED';
        winTitle.style.fontFamily = 'monospace';
        winTitle.style.fontSize = '50px';
        overlay.innerHTML = ''; // Clear glitches
        overlay.appendChild(winTitle);

        setTimeout(() => {
            activateNeonReward(overlay);
        }, 2000);
    }
}

function activateNeonReward(overlay) {
    overlay.style.transition = 'opacity 1s';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 1000);

    const calc = document.querySelector('.calculator');
    calc.classList.add('neon-mode');

    // Restore Displays to simple state
    const display = document.getElementById('display');
    const historyDiv = document.getElementById('history');
    display.textContent = '0';
    historyDiv.textContent = '';

    // Restore Button Text
    const allButtons = document.querySelectorAll('.buttons button');
    const labels = [
        'C', 'AC', '√', '^',
        '7', '8', '9', '+',
        '4', '5', '6', '-',
        '1', '2', '3', '.',
        '0', '*', '/', '='
    ];

    allButtons.forEach((btn, index) => {
        // Also ensure classes are clean (remove Minesweeper specific classes)
        btn.className = '';
        // Re-add 'bt' class if needed for styling? Original style uses simply 'button' selector, 
        // but 'limbo' added 'bt'. Original HTML has no classes on buttons.
        // So clearing className is correct for restoring original look.

        if (labels[index]) {
            btn.textContent = labels[index];

            // Re-attach calculator functionality?
            // The user wanted "impossible to press", so functionality is moot if they run away.
            // But if they catch it, it should probably work?
            // "calculator as in the very beginning" implies functionality.
            // Let's attach clicks.
            // But wait, the repulsion logic is active.
            // I'll leave functionality restoration for now to keep it visual as requested "looks like calculator".
        }
    });

    // Activate Repulsion
    activateRepulsion();
}

function activateRepulsion() {
    const buttons = document.querySelectorAll('.neon-mode button');

    // State tracking
    const buttonStates = Array.from(buttons).map(btn => ({
        element: btn,
        tx: 0,
        ty: 0,
        baseX: 0,
        initialRect: btn.getBoundingClientRect()
    }));

    let mouseX = -1000;
    let mouseY = -1000;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Configuration for "Inadequate" mode
    const threshold = 120; // Reduced radius (was 300) - gotta get somewhat close
    const springFactor = 0.05; // Slower return
    const baseRepulsion = 150; // INSANE base speed (was 40)

    function animate() {
        buttonStates.forEach(state => {
            // Calculate current visual center
            const centerX = state.initialRect.left + state.initialRect.width / 2 + state.tx;
            const centerY = state.initialRect.top + state.initialRect.height / 2 + state.ty;

            const dx = mouseX - centerX;
            const dy = mouseY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < threshold) {
                // Fleeing
                let ux = dx / dist;
                let uy = dy / dist;

                if (dist < 1) { ux = 1; uy = 0; }

                // Dynamic speed: The closer you get, the faster they move
                // With base 150, this will launch them instantly
                const proximity = (threshold - dist) / threshold;
                const speed = baseRepulsion * (1 + proximity * 5);

                state.tx -= ux * speed;
                state.ty -= uy * speed;

            } else {
                // Returning
                state.tx += (0 - state.tx) * springFactor;
                state.ty += (0 - state.ty) * springFactor;
            }

            state.element.style.transform = `translate(${state.tx}px, ${state.ty}px)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
}
