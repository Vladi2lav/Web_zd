let display = document.getElementById('display');
let historyDiv = document.getElementById('history');
let toggle = document.getElementById('toggle');
let equalsButton = document.getElementById('equals');
let currentInput = '';
let operator = '';
let previousInput = '';
let history = [];
let someFeature = false;
let escapeStage = 0;
let chaosInterval = null;
let gridPositions = [];

function appendToDisplay(value) {
    if (['+', '-', '*', '/', '^'].includes(value)) {
        if (currentInput !== '') {
            if (previousInput !== '' && operator !== '') {
                calculate();
            }
            operator = value;
            previousInput = currentInput;
            currentInput = '';
        }
    } else {
        currentInput += value;
        display.textContent = currentInput;
    }
}

function calculate() {
    if (previousInput !== '' && currentInput !== '' && operator !== '') {
        let result;
        const prev = parseFloat(previousInput);
        const curr = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(curr)) {
            display.textContent = 'Error';
            addToHistory(`${previousInput} ${operator} ${currentInput} = Error`);
            reset();
            return;
        }
        switch (operator) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/':
                if (curr === 0) {
                    display.textContent = 'Error';
                    addToHistory(`${prev} / ${curr} = Error`);
                    reset();
                    return;
                }
                result = prev / curr;
                break;
            case '^': result = Math.pow(prev, curr); break;
        }
        if (isNaN(result)) {
            display.textContent = 'Error';
            addToHistory(`${prev} ${operator} ${curr} = Error`);
            reset();
            return;
        }
        display.textContent = result;
        addToHistory(`${prev} ${operator} ${curr} = ${result}`);
        currentInput = result.toString();
        previousInput = '';
        operator = '';
    }
}

function sqrt() {
    if (currentInput !== '') {
        const num = parseFloat(currentInput);
        if (isNaN(num) || num < 0) {
            display.textContent = 'Error';
            addToHistory(`√${currentInput} = Error`);
            reset();
            return;
        }
        const result = Math.sqrt(num);
        display.textContent = result;
        addToHistory(`√${num} = ${result}`);
        currentInput = result.toString();
    }
}

function clearDisplay() {
    display.textContent = '0';
    currentInput = '';
    operator = '';
    previousInput = '';
}

function clearHistory() {
    history = [];
    historyDiv.innerHTML = '';
}

function addToHistory(operation) {
    history.push(operation);
    historyDiv.innerHTML = history.join('<br>');
}

function reset() {
    currentInput = '';
    operator = '';
    previousInput = '';
}

function toggleFeature() {
    someFeature = !someFeature;
    if (someFeature) {
        stopChaos();
    }
}

equalsButton.addEventListener('mouseover', function () {
    if (someFeature) return;

    if (escapeStage === 0) {
        this.style.transform = 'translateX(150px)';
        escapeStage = 1;
    } else if (escapeStage === 1) {
        // Движение ВПРАВО и ВВЕРХ
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

        allButtons.forEach(btn => {
            btn.textContent = '?';
            btn.classList.add('mystery-state');

            // Убираем переворот (возвращаем лицом)
            btn.classList.remove('chaos-mode');

            // Сбрасываем ВЕСЬ transform (включая повороты и смещения от limbo)
            btn.style.transform = 'rotateY(0deg) rotateZ(0deg)';
        });

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

    equalsButton.classList.remove('limbo');
    escapeStage = 0;
    gridPositions = [];
}