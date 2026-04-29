let classP = localStorage.getItem("class");

const input = document.querySelector("input");
const container = document.getElementById("container");
const span = document.querySelector("span");

if(classP) window.open("main.html", "_self");

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") SaveClass();
});

function SaveClass(){
    inputClass = input.value.trim().replace("/", ".").toLowerCase();

    if(IsClass(inputClass)){
        localStorage.setItem("class", `${inputClass},${inputClass.split(".")[0]}.abc`);
        window.open("main.html", "_self");
    }
    else{
        span.textContent = "Helytelen osztály! pl(9.a)";
    }
}

function IsClass (value) {
    return /^(9|1[0-3])\.(a|b|c|ny)$/.test(value);
}