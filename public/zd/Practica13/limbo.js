let limboClickCounter = 0;

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
            if (typeof minesweeperActive !== 'undefined' && minesweeperActive) {
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
                    if (typeof startMinesweeper === 'function') {
                        startMinesweeper(index);
                    }
                    break;
                default:
                    // Just change class for further clicks if any
                    break;
            }
        });

        // Add Context Menu for Flags (only works when active)
        newBtn.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            if (typeof minesweeperActive !== 'undefined' && minesweeperActive) {
                handleMinesweeperRightClick(index, newBtn);
            }
        });
    });
}
