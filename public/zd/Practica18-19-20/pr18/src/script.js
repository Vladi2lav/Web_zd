import carousel from "./carousel.js";
import './carousel.module.css'

new carousel(document.querySelector("#carousel_1"), "top");
new carousel(document.querySelector("#carousel_2"), "bottom");
new carousel(document.querySelector("#carousel_3"), "center");