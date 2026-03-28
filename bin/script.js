
let classP = localStorage.getItem("class");
let indexP = parseInt(localStorage.getItem("index"));

const container = document.getElementById("container");
const chooseClass = document.getElementById("chooseClass");
let controller = new AbortController() // a fetch leállításához, ha fetch közben kattintok a gombra

if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.querySelector("header > img").src = "bin/dark.png";

if (!classP){
    chooseClass.style.display = "flex";
    container.style.display = "none";
}

if (indexP != undefined && isNaN(indexP)){
    SetColor(indexP);
    LoadData(GetDate(indexP));
}

function SaveClass(){
    const inputClass = document.querySelector("#chooseClass input").value.trim().replace("/", ".").toLowerCase();

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
    controller.abort("LEÁLLÍTÁS");
    controller = new AbortController();
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

async function LoadData(date) {
    const result = document.getElementById("info");
    const tableBody = document.getElementById("table-body");
    const tableFoot = document.getElementById("table-foot");

    result.textContent = "Óracsere betöltése...";
    
    tableBody.innerHTML = "";
    tableFoot.innerHTML = "";
    
    

    fetch(`https://oracsereapi.vercel.app/api/proxy?date=${date}&classP=${classP}`, {
        signal: controller.signal // ha többször is kattintasz a gombra, akkor is csak egyszer írja ki a dolgokat
    })
    .then(async response => {

        const data = await response.json();

        if (!response.ok) {
            result.textContent =  "ERROR";
            console.log("HIBA: "+data.error)
            throw new Error(data.error || "Ismeretlen hiba");
        }

        return data;
    })
    .then(data => {
        if (!data.CONTENT || data.CONTENT.length === 0) {
            tableBody.innerHTML = "<tr><td>Nincs óracsere</td></tr>";
            result.textContent = "";
            return;
        }

        result.textContent = "";
        try {
            data.CONTENT.forEach(row => {
                let tr = document.createElement("tr");
                let note = row.find(item => item.includes("[jegyzet]"))?.replace(/\[.*?\]/g, "");
                if (note != undefined) { // ha van jegyzet
                    let td = document.createElement("td")
                    td.innerHTML = note
                    td.rowSpan = 4;
                    td.style.border = "2px dashed red"
                    tr.appendChild(td)
                } else { // ha nincs
                    let num = row.find(item => item.includes("[hanyadik]"))?.replace(/\[.*?\]/g, "");
                    let cl = row.find(item => item.includes("[osztály]"))?.replace(/\[.*?\]/g, "");
                    let N_subject = row.find(item => item.includes("[A_óra]"))?.replace(/\[.*?\]/g, "");
                    let C_subject = row.find(item => item.includes("[T_óra]"))?.replace(/\[.*?\]/g, "");
                    let N_classr = row.find(item => item.includes("[A_terem]"))?.replace(/\[.*?\]/g, "");
                    let C_classr = row.find(item => item.includes("[CS_terem]"))?.replace(/\[.*?\]/g, "");
                    let tdClass = document.createElement("td");
                    let tdNum = document.createElement("td")
                    let tdSubject = document.createElement("td");
                    let tdClassr = document.createElement("td");

                    if (cl == undefined || num == undefined) {
                        throw "Tudjuk mi a dörgés"
                    }

                    tdClass.innerHTML = cl;
                    tdNum.innerHTML = num+" óra";
                    if (C_subject == "-" || C_subject?.includes("--")) {
                        tdSubject.innerHTML = "ELMARAD"
                        
                    } else if (C_subject == undefined){
                        tdSubject.innerHTML = N_subject
                    } else {
                        tdSubject.innerHTML = N_subject+" → "+C_subject
                    }
                    tr.appendChild(tdClass)
                    tr.appendChild(tdNum)
                    tr.appendChild(tdSubject)

                    if (C_classr == undefined && N_classr != undefined) {
                        tdClassr.innerHTML = N_classr;
                        tr.appendChild(tdClassr)
                    } else if (C_classr != undefined) {
                        tdClassr.innerHTML = N_classr+" → "+C_classr
                        tr.appendChild(tdClassr)
                    } else {
                        tdSubject.colSpan = 2
                    }

                }
                tableBody.appendChild(tr);
            });
        } catch (e) {
            result.textContent = "Valami gond van, használd a PDF-et!"
            console.log(e)
        }



        tableFoot.innerHTML = ""; 

        const oldBtn = document.getElementById("pdfButton"); // ez a rész a pdf button középre igazítása miatt került meghosszabbításra
        if (oldBtn) oldBtn.remove();

        if (data.href) {
            let btn = document.createElement("button");
            btn.id = "pdfButton";
            btn.textContent = "PDF";
            btn.onclick = () => OpenPDF(data.href);
            container.appendChild(btn); 
        }
    })
    .catch(error => {
        if (error != "LEÁLLÍTÁS") {
            result.textContent = "HIBA";
            console.log(error.message)
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
    try {
        const buttons = document.querySelectorAll("#container > div button");
        buttons.forEach(button => button.id = "")

        buttons[index].id = "active";
    } catch {}

}

function IsClass (value) {
    return /^(9|1[0-3])\.(a|b|c|ny)$/.test(value);
}

function ChangeClass(){
    localStorage.clear();
    location.reload();
}
