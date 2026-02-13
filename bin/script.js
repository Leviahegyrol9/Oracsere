let classP = localStorage.getItem("class");
let indexP = parseInt(localStorage.getItem("index"));

const container = document.getElementById("container");
const chooseClass = document.getElementById("chooseClass");

if (!classP){
    chooseClass.style.display = "flex";
    container.style.display = "none";
}

if (indexP != undefined){
    SetColor(indexP);
    LoadData(GetDate(indexP));
}

function SaveClass(){
    const inputClass = document.querySelector("#chooseClass input").value.trim().replace("/", ".");

    if(IsClass(inputClass)){
        localStorage.setItem("class", `${inputClass},${inputClass.split(".")[0]}.abc`);
        classP = `${inputClass},${inputClass.split(".")[0]}.abc`;
        
        chooseClass.style.display = "none";
        container.style.display = "flex";
    }
    else{
        document.querySelector("#chooseClass span").textContent = "Helytelen osztály! pl(9.a)";
    }
}

function ClickBtn(index){
    SetColor(index);

    localStorage.setItem("index", index);
    indexP = index;

    LoadData(GetDate(index));
}

function GetDate(index){
    let today = new Date();

    switch (index){
        case 1:
            let tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return CleanDate(tomorrow.toLocaleDateString("hu-HU"));

        default:
            return CleanDate(today.toLocaleDateString("hu-HU"));
    }
}

function LoadData(date) {
    const result = document.getElementById("info");
    const tableBody = document.getElementById("table-body");

    result.textContent = "Óracsere betöltése..";
    tableBody.innerHTML = "";

    fetch(`https://oracsereapi.vercel.app/api/proxy?date=${date}&classP=${classP}`)
        .then(response => {
            console.log(response.status);
            if (response.status != 200) {              
                result.textContent = `${response.status} - ${response.statusText}`;
                throw new Error("Response was not ok!");
            }

            return response.json();
        })
        .then(data => {

            if (!data.rows || data.rows.length === 0) {
                tableBody.innerHTML = "<tr><td>Nincs óracsere</td></tr>";
                result.textContent = "";
                return;
            }

            data.rows.forEach(row => {
                const tr = document.createElement("tr");
                const td = document.createElement("td");

                td.textContent = row;
                tr.appendChild(td);
                tableBody.appendChild(tr);
            });

            result.textContent = "";

        })
        .catch(error => {
            result.textContent = error.message;
        });
}

function CleanDate(date){
    return date.replaceAll(".","").replaceAll(" ","");
}

function SetColor(index){
    const buttons = document.querySelectorAll("#container > div button");

    buttons.forEach(button => button.id = "")

    buttons[index].id = "active";
}

function IsClass (value) {
    const values = value.split(".");

    return /^(9|1[0-3])$/.test(values[0]) && /^(a|b|c|ny)$/.test(values[1]);
}

function ChangeClass(){
    localStorage.clear();
    location.reload();
}