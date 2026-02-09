if (localStorage.getItem("index")){
    const index = parseInt(localStorage.getItem("index"));

    SetColor(index);

    LoadData(GetDate(index));
}
else{
    result.textContent = "Nincs adat!";
}

function ClickBtn(index){
    SetColor(index);

    localStorage.setItem("index", index);

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

    fetch(`https://oracsereapi.vercel.app/api/proxy?date=${date}`)
        .then(res => res.json())
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
    const buttons = document.querySelectorAll("button");

    buttons.forEach(button => button.id = "")

    buttons[index].id = "active";
}