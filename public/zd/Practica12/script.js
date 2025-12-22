const input = document.getElementById("input");
const btn = document.getElementById("add");
const list = document.getElementById("list");

btn.addEventListener("click", () => {
    if (input.value === "") return;

    const li = document.createElement("li");
    li.textContent = input.value;
    list.append(li);

    input.value = "";
});
