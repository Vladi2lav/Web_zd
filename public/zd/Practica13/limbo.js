let limboClickCounter = 0;

function startLimboEndPhase() {
    const allButtons = document.querySelectorAll('.buttons button');
    limboClickCounter = 0; 
    allButtons.forEach((btn, index) => {
        
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        
        newBtn.className = 'bt chaos-mode';
        newBtn.style = '';
        newBtn.textContent = '?';
        newBtn.id = ''; 
        newBtn.removeAttribute('onclick'); 

        
        setTimeout(() => {
            newBtn.classList.remove('chaos-mode');
        }, 100);

        
        newBtn.addEventListener('click', function (e) {
            if (typeof minesweeperActive !== 'undefined' && minesweeperActive) {
                handleMinesweeperClick(index, newBtn);
                return;
            }

          
            limboClickCounter++;

            
            this.className = 'bt' + limboClickCounter;

            
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
                   
                    document.querySelector('.calculator').classList.add('move-left');
                    break;
                case 4:
                    
                    if (typeof startMinesweeper === 'function') {
                        startMinesweeper(index);
                    }
                    break;
                default:
                    
                    break;
            }
        });

        
        newBtn.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            if (typeof minesweeperActive !== 'undefined' && minesweeperActive) {
                handleMinesweeperRightClick(index, newBtn);
            }
        });
    });
}
