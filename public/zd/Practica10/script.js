const h1 = document.querySelector("h1");
const p = document.querySelector("p");
const img = document.querySelector("img");

h1.textContent = "Заголовок";
p.textContent = "Текст параграфа";
img.src = "https://picsum.photos/300/200";

const div = document.createElement("div");
div.style.background = "black";
div.style.color = "white";
div.textContent = "Новый блок";
document.body.append(div);
