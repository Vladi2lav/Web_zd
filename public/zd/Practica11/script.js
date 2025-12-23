
let header_button = document.querySelector(".mobile_icon");
function close_popup() {
    document.querySelector("header").classList.remove("open");
}


header_button.addEventListener("click", function() {
    if (document.querySelector("header").classList.contains("open")) {
        close_popup();
        return;
    }
    document.querySelector("header").classList.add("open");
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
});