
let header_button = document.querySelector(".mobile_icon");
function close_popup() {
    document.querySelector("header").classList.remove("open");
}

function attachImageClickHandlers() {
    const images = document.querySelectorAll(".grid img");
    images.forEach(img => addImageClickHandler(img));
}

function addImageClickHandler(img) {
    img.addEventListener("click", function() {
        const modal = document.createElement("div");
        modal.classList.add("image-modal-overlay");
        modal.innerHTML = `
                <img src="${this.src}" alt="" class="modal-img">      
        `;
        document.body.append(modal);
        modal.addEventListener("click", function(e) {
            if (e.target === modal || e.target.classList.contains("close-btn")) {
                modal.remove();
            }
        });
    });
}


header_button.addEventListener("click", function() {
    let heade = document.getElementById("g");
    if (document.querySelector("header").classList.contains("open")) {
        heade.src="menu.png";
        close_popup();
        return;
    }
    document.querySelector("header").classList.add("open");
    heade.src="close.png";
});


let grid_element = document.querySelector(".grid");
if (grid_element) {
    grid_element.addEventListener("click", close_popup);
}

document.querySelector("header .popup").addEventListener("click", close_popup);


document.querySelector("#show_add_photo").addEventListener("click", function() {
    document.querySelector("#add_new_photo").classList.add("open");
});

document.querySelector("#cancel").addEventListener("click", function() {
    document.querySelector("#add_new_photo").classList.remove("open");
});

document.querySelector("#add_photo").addEventListener("click", function() {
    let src = document.querySelector("#new_photo_src").value;
    let text = document.querySelector("#new_photo_text").value;

    if (src === "") {
        alert("Введите ссылку на фото");
        return;
    }

    let new_photo_div = document.createElement("div");
    new_photo_div.classList.add("photo");

    let new_img = document.createElement("img");
    new_img.src = src;

    let new_p = document.createElement("p");
    new_p.innerText = text;

    new_photo_div.append(new_img);
    new_photo_div.append(new_p);

    document.querySelector(".grid").prepend(new_photo_div);

    document.querySelector("#add_new_photo").classList.remove("open");
    document.querySelector("#new_photo_src").value = "";
    document.querySelector("#new_photo_text").value = "";
    addImageClickHandler(new_img);
});
attachImageClickHandlers();
