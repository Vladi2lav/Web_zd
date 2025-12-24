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

        // Limbo phase ends, clear everything and start new logic
        startLimboEndPhase();

        equalsButton.classList.remove('limbo');

    }, 3000);
}

let limboClickCounter = 0;
let minesweeperActive = false;
let minesweeperGrid = []; // Items: { isMine: bool, isOpen: bool, isFlagged: bool, value: count }
const TOTAL_MINES = 4;

function startLimboEndPhase() {
    const allButtons = document.querySelectorAll('.buttons button');
    limboClickCounter = 0; // Reset just in case

    allButtons.forEach((btn, index) => {
        // Clone to remove existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Clear all classes and styles, set to 'bt'
        newBtn.className = 'bt';
        newBtn.style = '';
        newBtn.textContent = '?';
        newBtn.id = ''; // Remove specific IDs to normalize behavior
        newBtn.removeAttribute('onclick'); // Remove arithmetic handlers

        // Add new click listener
        newBtn.addEventListener('click', function (e) {
            if (minesweeperActive) {
                handleMinesweeperClick(index, newBtn);
                return;
            }

            // Standard Limbo Progression
            limboClickCounter++;

            // Remove 'bt' and add specific class
            this.className = 'bt' + limboClickCounter;

            // Switch layout for steps
            switch (limboClickCounter) {
                case 1:
                    this.textContent = 'это не =';
                    this.classList.add('flipped-text');
                    break;
                case 2:
                    this.textContent = 'это тоже не то';
                    this.classList.add('flipped-text');
                    break;
                case 3:
                    this.textContent = 'уже близко';
                    this.classList.add('flipped-text');
                    // Move calculator left
                    document.querySelector('.calculator').classList.add('move-left');
                    break;
                case 4:
                    // Start Minesweeper
                    startMinesweeper(index, allButtons);
                    break;
                default:
                    // Just change class for further clicks if any
                    break;
            }
        });

        // Add Context Menu for Flags (only works when active)
        newBtn.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            if (minesweeperActive) {
                handleMinesweeperRightClick(index, newBtn);
            }
        });
    });
}

function startMinesweeper(startIndex, originalButtons) {
    minesweeperActive = true;
    const allButtons = document.querySelectorAll('.buttons button');
    const totalCount = allButtons.length;
    const COLS = 4; // Grid has 4 columns

    // Clear Displays and Show Info
    const display = document.getElementById('display');
    const historyDiv = document.getElementById('history');

    display.textContent = 'САПЕР: Найди 4 мины!';
    historyDiv.innerHTML = 'ЛКМ - Открыть<br>ПКМ - Флаг';

    // 1. Reset visual state of all buttons for the game
    allButtons.forEach(btn => {
        btn.className = 'bt'; // specific game class later
        btn.textContent = '';
        btn.classList.remove('flipped-text');
    });

    // 2. Generate Grid
    minesweeperGrid = [];
    for (let i = 0; i < totalCount; i++) {
        minesweeperGrid.push({ isMine: false, isOpen: false, isFlagged: false, value: 0 });
    }

    // Place Mines (excluding startIndex)
    let minesPlaced = 0;
    while (minesPlaced < TOTAL_MINES) {
        const rand = Math.floor(Math.random() * totalCount);
        if (rand !== startIndex && !minesweeperGrid[rand].isMine) {
            minesweeperGrid[rand].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate Numbers
    const rows = Math.ceil(totalCount / COLS);

    for (let i = 0; i < totalCount; i++) {
        if (minesweeperGrid[i].isMine) continue;
        let count = 0;
        const row = Math.floor(i / COLS);
        const col = i % COLS;

        // Check neighbors
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < rows && c >= 0 && c < COLS) {
                    const idx = r * COLS + c;
                    if (idx < totalCount && minesweeperGrid[idx].isMine) count++;
                }
            }
        }
        minesweeperGrid[i].value = count;
    }

    // 3. Reveal the starting button immediately
    handleMinesweeperClick(startIndex, allButtons[startIndex]);
}

function handleMinesweeperClick(index, btn) {
    const tile = minesweeperGrid[index];
    if (tile.isOpen || tile.isFlagged) return; // Ignore open or flagged

    tile.isOpen = true;
    btn.classList.add('open');

    if (tile.isMine) {
        // GAME OVER Logic
        btn.classList.add('mine');
        btn.textContent = '💣';
        revealAllMines();
        alert('Бум! Попробуй еще раз (нужен перезапуск страницы)');
        // Optional: Reset logic here if desired
    } else {
        if (tile.value > 0) {
            btn.textContent = tile.value;
            btn.classList.add('val-' + tile.value);
        } else {
            // Auto open neighbors if 0
            openNeighbors(index);
        }
        checkWinCondition(index);
    }
}

function handleMinesweeperRightClick(index, btn) {
    const tile = minesweeperGrid[index];
    if (tile.isOpen) return;

    tile.isFlagged = !tile.isFlagged;
    if (tile.isFlagged) {
        btn.classList.add('flag');
        btn.textContent = '🚩';
    } else {
        btn.classList.remove('flag');
        btn.textContent = '';
    }
    checkWinCondition(index);
}

function openNeighbors(index) {
    const allButtons = document.querySelectorAll('.buttons button');
    const totalCount = allButtons.length;
    const COLS = 4;
    const rows = Math.ceil(totalCount / COLS);

    const row = Math.floor(index / COLS);
    const col = index % COLS;

    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < rows && c >= 0 && c < COLS) {
                const hazardIdx = r * COLS + c;
                if (hazardIdx < totalCount && !minesweeperGrid[hazardIdx].isOpen) {
                    handleMinesweeperClick(hazardIdx, allButtons[hazardIdx]);
                }
            }
        }
    }
}

function revealAllMines() {
    const allButtons = document.querySelectorAll('.buttons button');
    minesweeperGrid.forEach((tile, idx) => {
        if (tile.isMine) {
            allButtons[idx].classList.add('mine');
            allButtons[idx].textContent = '💣';
        }
    });
}

function checkWinCondition(lastIndex) {
    let allMinesFlagged = true;
    let allNonMinesOpen = true;

    for (let i = 0; i < minesweeperGrid.length; i++) {
        if (minesweeperGrid[i].isMine) {
            if (!minesweeperGrid[i].isFlagged) allMinesFlagged = false;
        } else {
            if (!minesweeperGrid[i].isOpen) allNonMinesOpen = false;
        }
    }

    if (allMinesFlagged && allNonMinesOpen) {
        gameWon(lastIndex);
    }
}

function gameWon(lastIndex) {
    minesweeperActive = false;
    alert('Победа! Вы нашли все мины.');

    // Restore Displays
    document.getElementById('display').textContent = '0';
    document.getElementById('history').innerHTML = '';

    // 1. Move calculator back
    document.querySelector('.calculator').classList.remove('move-left');

    const allButtons = document.querySelectorAll('.buttons button');

    // Clean up grid
    allButtons.forEach(btn => {
        btn.className = 'bt';
        btn.textContent = '';
        // Remove listeners by cloning again (simplest way to "stop" game interaction)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    // 3. Make the clicked button equals
    const freshButtons = document.querySelectorAll('.buttons button');

    // Fallback if needed
    let targetIndex = (typeof lastIndex === 'number') ? lastIndex : 10;

    if (freshButtons[targetIndex]) {
        const equalsBtn = freshButtons[targetIndex];
        equalsBtn.textContent = '=';
        equalsBtn.id = 'equals';
    }
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