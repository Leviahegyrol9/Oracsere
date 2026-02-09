const result = document.querySelector("span");

if (localStorage.getItem("index")){
    const index = parseInt(localStorage.getItem("index"));

    SetColor(index);

    LoadData(GetDay(index));
}
else{
    result.textContent = "Nincs adat!";
}

function ClickBtn(index){
    SetColor(index);

    localStorage.setItem("index", index);

    LoadData(GetDay(index));
}

function GetDay(index){
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

function LoadData(day) {

    fetch(`https://oracsereapi.vercel.app/api/proxy?day=1`)
        .then(res => res.json())
        .then(data => {

            const tableBody = document.getElementById("table-body");
            tableBody.innerHTML = "";

            if (!data.rows || data.rows.length === 0) {
                tableBody.innerHTML = "<tr><td>Nincs óracsere</td></tr>";
                return;
            }

            data.rows.forEach(row => {
                const tr = document.createElement("tr");
                const td = document.createElement("td");

                td.textContent = row;
                tr.appendChild(td);
                tableBody.appendChild(tr);
            });

        })
        .catch(err => {
            console.error(err);
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