let classP = localStorage.getItem("class");
let indexP = parseInt(localStorage.getItem("index"));

const input = document.querySelector("#chooseClass input");
const container = document.getElementById("container");
const chooseClass = document.getElementById("chooseClass");
let controller = new AbortController();

if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.querySelector("header > img").src = "bin/dark.png";

if (!classP){
    chooseClass.style.display = "flex";
    container.style.display = "none";
}

if (!indexP) indexP = 0;

if (indexP != undefined){
    SetColor(indexP);
    LoadData(GetDate(indexP));
}
if (chooseClass.style.display == "flex"){
    input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") SaveClass();
    });
}


function SaveClass(){
    inputClass = input.value.trim().replace("/", ".").toLowerCase();

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
    controller.abort("stop");
    controller = new AbortController();
    SetColor(index);

    localStorage.setItem("index", index);
    indexP = index;

    LoadData(GetDate(index));
}

function GetDate(index){
    let today = new Date();

    // return "20260330"; //ez a tesztelésre van, ide ird be a vizsgálando datumot

    switch (index){
        case 1:
            let tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return CleanDate(tomorrow.toLocaleDateString("hu-HU"));

        default:
            return CleanDate(today.toLocaleDateString("hu-HU"));
    }
}

async function LoadData(date) {
    const info = document.getElementById("info");
    const tableBody = document.getElementById("table-body");

    console.log(date);
    console.log(indexP);

    info.textContent = "Óracsere betöltése...";
    
    tableBody.innerHTML = "";

    fetch(`https://oracsereapi.vercel.app/api/proxy?date=${date}&classP=${classP}`, {
        signal: controller.signal
    })
    .then(async response => {

        const data = await response.json();

        if (!response.ok) {
            info.textContent = data.error || "Ismeretlen hiba";
            throw new Error(data.error || "Ismeretlen hiba");
        }

        return data;
    })
    .then(data => {

        info.textContent = "";

        if (!data.CONTENT || data.CONTENT.length === 0) {
            tableBody.innerHTML = "<tr><td>Nincs óracsere</td></tr>";
        }
        else{
            try {
                data.CONTENT.forEach(row => {
                    let tr = document.createElement("tr");
                    let note = row.find(item => item.includes("[jegyzet]"))?.replace(/\[.*?\]/g, "");
                    if (note != undefined) { // ha van jegyzet
                        let td = document.createElement("td");
                        td.innerHTML = note;
                        td.rowSpan = 4;
                        td.style.border = "2px dashed red";
                        tr.appendChild(td);
                    } else { // ha nincs
                        let num = row.find(item => item.includes("[hanyadik]"))?.replace(/\[.*?\]/g, "");
                        let cl = row.find(item => item.includes("[osztály]"))?.replace(/\[.*?\]/g, "");
                        let N_subject = row.find(item => item.includes("[A_óra]"))?.replace(/\[.*?\]/g, "");
                        let C_subject = row.find(item => item.includes("[T_óra]"))?.replace(/\[.*?\]/g, "");
                        let N_classr = row.find(item => item.includes("[A_terem]"))?.replace(/\[.*?\]/g, "");
                        let C_classr = row.find(item => item.includes("[CS_terem]"))?.replace(/\[.*?\]/g, "");
                        let tdClass = document.createElement("td");
                        let tdNum = document.createElement("td");
                        let tdSubject = document.createElement("td");
                        let tdClassr = document.createElement("td");

                        tdClass.innerHTML = cl;
                        tdNum.innerHTML = num+" óra";
                        if (C_subject == "-" || C_subject?.includes("--")) {
                            tdSubject.innerHTML = "ELMARAD";
                            
                        } else if (C_subject == undefined){
                            tdSubject.innerHTML = N_subject;
                        } else {
                            tdSubject.innerHTML = N_subject+" → "+C_subject;
                        }
                        tr.appendChild(tdClass);
                        tr.appendChild(tdNum);
                        tr.appendChild(tdSubject);

                        if (C_classr == undefined && N_classr != undefined) {
                            tdClassr.innerHTML = N_classr;
                            tr.appendChild(tdClassr);
                        } else if (C_classr != undefined) {
                            tdClassr.innerHTML = N_classr+" -> "+C_classr;
                            tr.appendChild(tdClassr);
                        } else {
                            tdSubject.colSpan = 2;
                        }

                    }
                    tableBody.appendChild(tr);
                });
            } catch (e) {
                info.textContent = "Valami gond van, használd a PDF-et!";

                let btn = document.createElement("button");
                btn.id = "pdfButton";
                btn.textContent = "PDF";
                btn.onclick = () => OpenPDF(data.href);
                container.appendChild(btn); 
                
                }
            }   
    })
    .catch(error => {
        if (error != "stop") {
            info.textContent = error.message;
        }
        
    });
}
function OpenPDF(href){
    window.open(href, "_blank");
}

function CleanDate(date){
    return date.replaceAll(".","").replaceAll(" ","");
}

function SetColor(index){
    try{
        const buttons = document.querySelectorAll("#container > div button");

        buttons.forEach(button => button.id = "")

        buttons[index].id = "active";
    }
    catch {}
    
}

function IsClass (value) {
    return /^(9|1[0-3])\.(a|b|c|ny)$/.test(value);
}

function ChangeClass(){
    localStorage.clear();
    location.reload();
}
