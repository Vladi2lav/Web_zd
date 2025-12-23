const h1 = document.querySelector("h1");
const p = document.querySelector("p");
const img = document.querySelector("img");

h1.textContent = "Заголовок";
p.textContent = "Текст параграфа";
img.src = "https://picsum.photos/999/200";

const div = document.createElement("div");
div.style.background = "black";
div.style.color = "white";
div.textContent = "Новый блок";
div.setAttribute("style", "width: 100px; height: 100px; border: 2px solid #1d1d1d; background: red");

document.body.append(div);

div.innerHTML = "<p>Это целый тег из JS</p>";


