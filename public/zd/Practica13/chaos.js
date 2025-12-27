let someFeature = false;
let escapeStage = 0;
let chaosInterval = null;
let gridPositions = [];

function toggleFeature() {
    someFeature = !someFeature;
    if (someFeature) {
        stopChaos();
    }
}

if (equalsButton) {
    equalsButton.addEventListener('mouseover', function () {
        if (someFeature) return;

        if (escapeStage === 0) {
            this.style.transform = 'translateX(150px)';
            escapeStage = 1;
        } else if (escapeStage === 1) {

            this.style.transform = 'translate(150px, -150px)';
            this.classList.add('limbo');
            escapeStage = 2;
        } else if (escapeStage === 2) {
            this.style.transform = 'translate(0, 0)';
            this.classList.remove('limbo');
            escapeStage = 3;

            setTimeout(() => {
                startChaos();
            }, 500);
        }
    });
}

function startChaos() {
    const allButtons = document.querySelectorAll('.buttons button');
    const container = document.querySelector('.buttons');

    if (gridPositions.length === 0) {
        const containerRect = container.getBoundingClientRect();
        allButtons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            gridPositions.push({
                left: rect.left - containerRect.left,
                top: rect.top - containerRect.top,
                width: rect.width,
                height: rect.height
            });
            if (!btn.getAttribute('data-orig-text')) {
                btn.setAttribute('data-orig-text', btn.textContent);
            }
        });
    }

    allButtons.forEach((btn, index) => {
        const pos = gridPositions[index];
        btn.style.position = 'absolute';
        btn.style.left = pos.left + 'px';
        btn.style.top = pos.top + 'px';
        btn.style.width = pos.width + 'px';
        btn.style.height = pos.height + 'px';
        btn.style.margin = '0';

        setTimeout(() => {
            btn.classList.add('chaos-mode');
        }, 100);
    });

    if (chaosInterval) clearInterval(chaosInterval);
    let indices = gridPositions.map((_, i) => i);

    const shuffle = () => {
        indices.sort(() => Math.random() - 0.5);
        allButtons.forEach((btn, i) => {
            const newPosIndex = indices[i];
            const newPos = gridPositions[newPosIndex];
            btn.style.left = newPos.left + 'px';
            btn.style.top = newPos.top + 'px';

            const randomAngle = (Math.random() * 20 - 10).toFixed(2);
            btn.style.transform = `rotateY(180deg) rotateZ(${randomAngle}deg)`;
        });
    };

    setTimeout(shuffle, 1000);
    chaosInterval = setInterval(shuffle, 500);

    setTimeout(() => {
        clearInterval(chaosInterval);
        chaosInterval = null;

    
        if (typeof startLimboEndPhase === 'function') {
            startLimboEndPhase();
        }

        equalsButton.classList.remove('limbo');

    }, 3000);
}

function stopChaos() {
    const allButtons = document.querySelectorAll('.buttons button');
    if (chaosInterval) clearInterval(chaosInterval);

    allButtons.forEach(btn => {
        btn.classList.remove('chaos-mode', 'mystery-state', 'limbo');

        const origText = btn.getAttribute('data-orig-text');
        if (origText) {
            btn.textContent = origText;
        }

        btn.style.position = '';
        btn.style.left = '';
        btn.style.top = '';
        btn.style.width = '';
        btn.style.height = '';
        btn.style.margin = '';
        btn.style.transform = '';
    });

    if (equalsButton) {
        equalsButton.classList.remove('limbo');
    }
    escapeStage = 0;
    gridPositions = [];
}
