import styles from './carousel.module.css'

export default class carousel {
    constructor(photos, pos = "center") {
        this.show_index = 0; 
        this.photos = photos.querySelectorAll(".photo");
        photos.querySelector(".prev").addEventListener("click", () => this.prev_photo());
        photos.querySelector(".next").addEventListener("click", () => this.next_photo());
        switch (pos){
            case "top": {
                photos.querySelectorAll("button").forEach(btn => {
                    btn.classList.add(styles.top);
                })}; break;

            case "bottom": {
                photos.querySelectorAll("button").forEach(btn => {
                    btn.classList.add(styles.bottom);
                });
            } break;

            default: {
                photos.querySelectorAll("button").forEach(btn => {
                    btn.classList.add(styles.center);
                });
            } break;
        }



    }

    next_photo() {
        this.photos[this.show_index].classList.remove("show");
        
        
        this.show_index++;

        if (this.show_index >= this.photos.length) {
            this.show_index = 0;
        }

        this.photos[this.show_index].classList.add("show");
    }

    prev_photo() {

        this.photos[this.show_index].classList.remove("show");


        this.show_index--;


        if (this.show_index < 0) {
            this.show_index = this.photos.length - 1;
        }


        this.photos[this.show_index].classList.add("show");
    }
}