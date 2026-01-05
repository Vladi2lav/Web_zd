export class Character {
    constructor(element) {
        this.element = element;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.width = 30;
        this.height = 30;

        this.speed = 5;
        this.jumpForce = 12;
        this.gravity = 0.6;
        this.onGround = false;

        
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.className = 'player';
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.updateView();
    }

    moveLeft() { this.vx = -this.speed; }
    moveRight() { this.vx = this.speed; }
    stopX() { this.vx = 0; }
    jump() {
        if (this.onGround) {
            this.vy = -this.jumpForce;
            this.onGround = false;
        }
    }

    update() {
       
        this.vy += this.gravity;

       
        this.x += this.vx;
        this.y += this.vy;

     
    }

    updateView() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
}
