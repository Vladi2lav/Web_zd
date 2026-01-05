import { Character } from './character.js';

const gameContainer = document.getElementById('game-container');
const barContainer = document.getElementById('bar-container');
const levelInfoLabel = document.getElementById('level-info');


function getLevelFromHash() {
    const hash = window.location.hash; 
    const match = hash.match(/level=(\d+)/);
    if (match) {
        let l = parseInt(match[1]);
        if (l >= 1 && l <= MAX_LEVELS) return l;
    }
    return null;
}

const MAX_LEVELS = 5;
let currentLevel = getLevelFromHash();
let player = null;
let gameLoopId;
let gameActive = false;
let score = 0;
let hp = 100;


const GRAVITY = 0.6;
const FRICTION = 0.8;

(async function init() {
    try {
        levelInfoLabel.innerText = "Loading HUD...";
        await loadComponent('bar.html', barContainer);
        updateHUD();

        if (currentLevel === null) {
            showMainMenu();
            levelInfoLabel.innerText = "Main Menu";
        } else {
            levelInfoLabel.innerText = "Loading Level " + currentLevel + "...";
            await loadLevel(currentLevel);
            gameActive = true;
            gameLoopId = requestAnimationFrame(loop);
        }

        gameContainer.focus();
    } catch (e) {
        console.error("Init Error:", e);
        levelInfoLabel.innerText = "Error: " + e.message;
        levelInfoLabel.style.color = "red";
    }


    window.addEventListener('hashchange', () => {
        const targetLvl = getLevelFromHash();
        if (targetLvl !== currentLevel) {
            currentLevel = targetLvl;
            respawn(); 
        }
    });
})();

async function loadComponent(url, target) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const html = await res.text();
    target.innerHTML = html;
}

async function loadLevel(lvlNum) {
    await loadComponent(`lvl${lvlNum}.html`, gameContainer);

    const startNode = gameContainer.querySelector('#start-pos');
    let startX = 50, startY = 200;

    if (startNode) {
        startX = parseInt(startNode.dataset.x) || 50;
        startY = parseInt(startNode.dataset.y) || 200;
    }


    const pEl = document.createElement('div');
    gameContainer.querySelector('.level-container').appendChild(pEl);

    player = new Character(pEl);
    player.setPosition(startX, startY);
    player.hp = hp; 

    levelInfoLabel.innerText = `Playing Level ${lvlNum}`;


    if (window.location.hash !== `#level=${lvlNum}`) {
        window.location.hash = `level=${lvlNum}`;
    }


    const switches = gameContainer.querySelectorAll('.switch');
    switches.forEach(sw => {
        sw.addEventListener('click', (e) => {
            e.stopPropagation(); 
            handleSwitch(sw);
        });
    });
}

function showMainMenu() {
    gameActive = false;
    cancelAnimationFrame(gameLoopId);

    gameContainer.innerHTML = `
        <div class="main-menu" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white;">
            <h1 style="font-size: 3rem; margin-bottom: 2rem; color: #38bdf8; text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);">Neon Platformer</h1>
            <div id="start-btn" style="padding: 15px 40px; font-size: 1.5rem; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; transition: transform 0.1s; box-shadow: 0 4px 0 #15803d;">
                START GAME
            </div>
            <p style="margin-top: 20px; color: #94a3b8;">Use A/D to Move, Space to Jump</p>
        </div>
    `;

 
    setTimeout(() => {
        const startBtn = gameContainer.querySelector('#start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {

                window.location.hash = '#level=1';
            });

            startBtn.addEventListener('mousedown', () => startBtn.style.transform = 'translateY(4px)');
            startBtn.addEventListener('mouseup', () => startBtn.style.transform = 'translateY(0)');
        }
    }, 0);
}

function handleSwitch(sw) {
    if (sw.classList.contains('active')) return; 
    sw.classList.toggle('active');
    const targetId = sw.dataset.target;
    const action = sw.dataset.action;


    const container = gameContainer.querySelector('.level-container');
    if (!container) return;


    if (targetId && !action) {
        const targetBlock = container.querySelector(`#${targetId}`);
        if (targetBlock) {
            targetBlock.classList.toggle('hidden');
        }
    }

    else if (action === 'reset-block' && targetId) {

        const block = container.querySelector(`#${targetId}`);
        if (block) {

            block.style.left = '100px';
            block.style.top = '240px';
            block.vx = 0; block.vy = 0; 


            sw.style.backgroundColor = '#1d4ed8'; 
            setTimeout(() => sw.style.backgroundColor = '#3b82f6', 200);
        }
    }
}


const keys = {};
window.addEventListener('keydown', e => {

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    keys[e.code] = true;
});
window.addEventListener('keyup', e => keys[e.code] = false);

let draggedElement = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

window.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('movable-block')) {
        draggedElement = e.target;
        const rect = draggedElement.getBoundingClientRect();

        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        draggedElement.style.cursor = 'grabbing';
    }
});

window.addEventListener('mousemove', (e) => {
    if (draggedElement) {
        const container = gameContainer.querySelector('.level-container');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();


        let newX = e.clientX - containerRect.left - dragOffsetX;
        let newY = e.clientY - containerRect.top - dragOffsetY;


        draggedElement.style.left = newX + 'px';
        draggedElement.style.top = newY + 'px';

        draggedElement.style.setProperty('left', newX + 'px', 'important');
        draggedElement.style.setProperty('top', newY + 'px', 'important');
    }
});

window.addEventListener('mouseup', () => {
    if (draggedElement) {
        draggedElement.style.cursor = 'pointer';
        draggedElement = null;
    }
});


function loop() {
    if (!gameActive || !player) {
        gameLoopId = requestAnimationFrame(loop);
        return;
    }


    if (keys['ArrowLeft'] || keys['KeyA']) player.moveLeft();
    else if (keys['ArrowRight'] || keys['KeyD']) player.moveRight();
    else player.stopX();

    if (keys['ArrowUp'] || keys['KeyW'] || keys['Space']) player.jump();

    player.update();

    const container = gameContainer.querySelector('.level-container');
    if (!container) return; 

    const rects = Array.from(container.children).map(el => {

        return {
            el: el,
            type: el.className,
    
        };
    });

    const pRect = {
        x: player.x,
        y: player.y,
        w: player.width,
        h: player.height,
        vx: player.vx,
        vy: player.vy
    };


    const cW = container.clientWidth;
    const cH = container.clientHeight;

    if (pRect.x < 0) { player.x = 0; player.vx = 0; }
    if (pRect.x > cW - pRect.w) { player.x = cW - pRect.w; player.vx = 0; }


    if (pRect.y > cH - pRect.h) {
        player.y = cH - pRect.h;
        player.vy = 0;
        player.onGround = true;
    }


    player.onGroundCheck = false;

    rects.forEach(obj => {
        if (obj.el === player.element || obj.type === 'start-pos') return;


        const oEl = obj.el;
        const oL = oEl.offsetLeft;
        const oT = oEl.offsetTop;
        const oW = oEl.offsetWidth;
        const oH = oEl.offsetHeight;

        if (checkOverlap(pRect, { x: oL, y: oT, w: oW, h: oH })) {
            if (obj.type.includes('platform')) {
                if (!obj.el.classList.contains('hidden')) {
                    resolvePlatform(player, { x: oL, y: oT, w: oW, h: oH });
                }
            } else if (obj.type.includes('movable-block')) {
                resolveMovableBlock(player, obj, { x: oL, y: oT, w: oW, h: oH });
            } else if (obj.type.includes('switch')) {
                resolvePlatform(player, { x: oL, y: oT, w: oW, h: oH });
            } else if (obj.type.includes('coin')) {
                score += 10;
                obj.el.remove();
                updateHUD();
            } else if (obj.type.includes('spike')) {
                player.vy = -12; 
                hp -= 10;
                updateHUD();
                if (hp <= 0) respawn();
            } else if (obj.type.includes('goal')) {
                nextLevel();
            }
        }
    });

    if (player.onGroundCheck) player.onGround = true;

    updateBlocks(rects);

    player.updateView();
    gameLoopId = requestAnimationFrame(loop);
}

function updateBlocks(allRects) {
    const blocks = allRects.filter(r => r.type.includes('movable-block'));
    const solids = allRects.filter(r => r.type.includes('platform') || r.type.includes('movable-block')); // Blocks collide with platforms and other blocks

    blocks.forEach(blockObj => {
        const el = blockObj.el;
        if (draggedElement === el) return; 

    
        if (typeof el.vx === 'undefined') { el.vx = 0; el.vy = 0; }

    
        el.vy += GRAVITY;
        el.vx *= FRICTION; 

        if (Math.abs(el.vx) < 0.1) el.vx = 0;

     
        let currLeft = parseFloat(el.style.left) || 0;
        let nextX = currLeft + el.vx;

   
        let bRect = { x: nextX, y: parseFloat(el.style.top) || 0, w: el.offsetWidth, h: el.offsetHeight };

        let colX = false;
    
        for (let s of solids) {
            if (s.el === el) continue; 
            if (s.el.classList.contains('hidden')) continue;

            let sRect = { x: s.el.offsetLeft, y: s.el.offsetTop, w: s.el.offsetWidth, h: s.el.offsetHeight };
            if (checkOverlap(bRect, sRect)) {
             
                colX = true;
                el.vx = -el.vx * 0.5; 
                break;
            }
        }
        if (!colX) el.style.left = nextX + 'px';

      
        let currTop = parseFloat(el.style.top) || 0;
        let nextY = currTop + el.vy;
        bRect.x = parseFloat(el.style.left) || 0; 
        bRect.y = nextY;

        let colY = false;
        let landed = false;
     
        const container = gameContainer.querySelector('.level-container');
        if (nextY > container.clientHeight - el.offsetHeight) {
            nextY = container.clientHeight - el.offsetHeight;
            el.vy = 0;
            el.vx *= 0.8; 
            colY = true;
        }

        for (let s of solids) {
            if (s.el === el) continue;
            if (s.el.classList.contains('hidden')) continue;

            let sRect = { x: s.el.offsetLeft, y: s.el.offsetTop, w: s.el.offsetWidth, h: s.el.offsetHeight };
            if (checkOverlap(bRect, sRect)) {
                colY = true;
                if (el.vy > 0) {
             
                    let overlapY = (bRect.y + bRect.h) - sRect.y;
                    nextY -= overlapY;
                    el.vy = 0;
                    el.vx *= 0.8; 
                    landed = true;
                } else if (el.vy < 0) { 
                    nextY = sRect.y + sRect.h;
                    el.vy = 0;
                }
                break;
            }
        }

        el.style.top = nextY + 'px';
    });
}

function nextLevel() {
    currentLevel++;
    if (currentLevel > MAX_LEVELS) {
        alert("You Win! Restarting.");
        currentLevel = 1;
        score = 0;
        hp = 100;
    }
    loadLevel(currentLevel);
    updateHUD();
}

function respawn() {
    hp = 100;
    loadLevel(currentLevel); 
    updateHUD();
}

function updateHUD() {
    const hHp = document.getElementById('hud-hp');
    const hScore = document.getElementById('hud-score');
    const hLvl = document.getElementById('hud-level');
    if (hHp) hHp.innerText = `HP: ${hp}`;
    if (hScore) hScore.innerText = `Score: ${score}`;
    if (hLvl) hLvl.innerText = `Lvl: ${currentLevel}`;
}

function checkOverlap(a, b) {
    return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
}

function resolvePlatform(p, obst) {
    const dx = (p.x + p.width / 2) - (obst.x + obst.w / 2);
    const dy = (p.y + p.height / 2) - (obst.y + obst.h / 2);
    const combinW = p.width / 2 + obst.w / 2;
    const combinH = p.height / 2 + obst.h / 2;

    if (Math.abs(dx) < combinW && Math.abs(dy) < combinH) {
        const ox = combinW - Math.abs(dx);
        const oy = combinH - Math.abs(dy);

        if (ox >= oy) {
            if (dy > 0) {
                p.y += oy; p.vy = 0;
            } else {
                p.y -= oy; p.vy = 0;
                p.onGround = true;
                p.onGroundCheck = true;
            }
        } else {
            if (dx > 0) p.x += ox; else p.x -= ox;
            p.vx = 0;
        }
    }
}

function resolveMovableBlock(p, obj, obst) {
    const dx = (p.x + p.width / 2) - (obst.x + obst.w / 2);
    const dy = (p.y + p.height / 2) - (obst.y + obst.h / 2);
    const combinW = p.width / 2 + obst.w / 2;
    const combinH = p.height / 2 + obst.h / 2;

    if (Math.abs(dx) < combinW && Math.abs(dy) < combinH) {
        const ox = combinW - Math.abs(dx);
        const oy = combinH - Math.abs(dy);

        if (ox >= oy) {
          
            if (dy > 0) { 
                p.y += oy; p.vy = 0;
            } else { 
                p.y -= oy; p.vy = 0;
                p.onGround = true;
                p.onGroundCheck = true;
            }
        } else {
     
            if (dx > 0) {

                if (p.vx < 0) {
                    obj.el.vx = -5; 
                }
                p.x += ox; 
            } else {
            
                if (p.vx > 0) {
                    obj.el.vx = 5;
                }
                p.x -= ox; 
            }
            window.
            p.x -= ox; 
        }
        p.vx = 0;
    }
}

