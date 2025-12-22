const btn = document.getElementById("btn");
const menu = document.getElementById("menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("open");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
});
