class Carousel {
    constructor(photos) {
        this.photos = photos;
        this.show_index = 0; 
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