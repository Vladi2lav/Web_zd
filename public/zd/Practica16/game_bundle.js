// Hardcoded Data to prevent Fetch Errors
const LEVELS = [
    {
        player: { x: 50, y: 300, w: 30, h: 30, color: 'red' },
        goal: { x: 700, y: 400, w: 50, h: 50 },
        platforms: [
            { x: 0, y: 550, w: 800, h: 50 },
            { x: 200, y: 450, w: 150, h: 20 },
            { x: 450, y: 350, w: 150, h: 20 },
            { x: 600, y: 200, w: 100, h: 20 }
        ],
        coins: [
            { x: 300, y: 400, w: 20, h: 20 },
            { x: 500, y: 300, w: 20, h: 20 }
        ]
    }
];

const debugEl = document.getElementById('debug');
const area = document.getElementById('game-area');
const keys = {};

// Game State
let player = { x: 0, y: 0, vx: 0, vy: 0, w: 30, h: 30, onGround: false, el: null };
let entities = [];
let loopId;

// Error Trap
window.onerror = (msg) => { debugEl.innerText = "ERROR: " + msg; debugEl.style.color = 'red'; };

function log(msg) {
    debugEl.innerText = msg;
}

// Input
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function init() {
    log("Starting Game...");
    loadLevel(0);
    loop();
}

function loadLevel(idx) {
    area.innerHTML = ''; // prevent accumulation
    const data = LEVELS[0]; // Simple hardcoded level

    // Spawn Player
    player.x = data.player.x;
    player.y = data.player.y;
    player.w = data.player.w;
    player.h = data.player.h;
    player.vx = 0; player.vy = 0;

    player.el = document.createElement('div');
    player.el.className = 'player';
    Object.assign(player.el.style, { width: player.w + 'px', height: player.h + 'px', backgroundColor: data.player.color });
    area.appendChild(player.el);

    entities = [];

    // Platforms
    data.platforms.forEach(p => addEntity(p, 'platform'));
    // Coins
    data.coins.forEach(c => addEntity(c, 'coin'));
    // Goal
    addEntity(data.goal, 'goal');

    log("Level Loaded. Press Keys.");
}

function addEntity(cfg, type) {
    const el = document.createElement('div');
    el.className = type;
    el.style.left = cfg.x + 'px';
    el.style.top = cfg.y + 'px';
    el.style.width = cfg.w + 'px';
    el.style.height = cfg.h + 'px';
    area.appendChild(el);
    entities.push({ x: cfg.x, y: cfg.y, w: cfg.w, h: cfg.h, type: type, el: el });
}

function loop() {
    // 1. Logic
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -5;
    else if (keys['ArrowRight'] || keys['KeyD']) player.vx = 5;
    else player.vx = 0;

    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.onGround) {
        player.vy = -12;
        player.onGround = false;
    }

    // Gravity
    player.vy += 0.6;

    // 2. Movement X
    player.x += player.vx;
    // Boundary X
    if (player.x < 0) player.x = 0;
    if (player.x > area.clientWidth - player.w) player.x = area.clientWidth - player.w;

    // Platform Collision X (Optional, usually we just do Y for simple platformers, but let's skip for simplicity)

    // 3. Movement Y
    player.y += player.vy;

    // Floor Boundary (Safety)
    if (player.y > area.clientHeight - player.h) {
        player.y = area.clientHeight - player.h;
        player.vy = 0;
        player.onGround = true;
    }

    // Platform Collision (Y only for landing)
    player.onGroundCheck = false;

    for (let ent of entities) {
        if (checkRect(player, ent)) {
            if (ent.type === 'platform') {
                // If falling down and hitting top
                if (player.vy > 0 && (player.y + player.h - player.vy) <= ent.y) {
                    player.y = ent.y - player.h;
                    player.vy = 0;
                    player.onGround = true;
                    player.onGroundCheck = true;
                }
            } else if (ent.type === 'coin') {
                ent.el.remove();
                ent.dead = true;
                log("Coin Collected!");
            } else if (ent.type === 'goal') {
                log("YOU WIN! Resetting...");
                player.x = 50; player.y = 300;
            }
        }
    }

    // Reset ground if we fell off a platform and didn't hit floor
    if (!player.onGroundCheck && player.y < area.clientHeight - player.h) {
        // Only set false if we are actually in air
        if (player.vy !== 0) player.onGround = false;
    }
    // Simple ground stickiness fix
    if (player.onGroundCheck) player.onGround = true;

    // 4. Render
    if (player.el) {
        player.el.style.transform = `translate(${player.x}px, ${player.y}px)`;
    }

    requestAnimationFrame(loop);
}

function checkRect(a, b) {
    if (b.dead) return false;
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Start
init();
