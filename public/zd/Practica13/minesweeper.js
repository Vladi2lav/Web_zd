let minesweeperActive = false;
let minesweeperGrid = []; // Items: { isMine: bool, isOpen: bool, isFlagged: bool, value: count }
const TOTAL_MINES = 4;

function startMinesweeper(startIndex) {
    minesweeperActive = true;
    const allButtons = document.querySelectorAll('.buttons button');
    const totalCount = allButtons.length;
    const COLS = 4; // Grid has 4 columns

    // Clear Displays and Show Info
    const display = document.getElementById('display');
    const historyDiv = document.getElementById('history');

    if (display) display.textContent = 'САПЕР: Найди 4 мины!';
    if (historyDiv) historyDiv.innerHTML = 'ЛКМ - Открыть<br>ПКМ - Флаг';

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
    const display = document.getElementById('display');
    const historyDiv = document.getElementById('history');
    if (display) display.textContent = '0';
    if (historyDiv) historyDiv.innerHTML = '';

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

        // Final Phase Trigger
        equalsBtn.addEventListener('click', function () {
            if (typeof initFinalPhase === 'function') {
                initFinalPhase();
            }
        });
    }
}
