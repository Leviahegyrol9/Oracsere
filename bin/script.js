const info = document.querySelector("span");

if (localStorage.getItem("day") && localStorage.getItem("id")){
    const day = parseInt(localStorage.getItem("day"));

    GetLink(GetDay(day));

    info.id = localStorage.getItem("id");
}
else{
    info.textContent = "Nincs adat!";
}

function ClickEvent(day){
    day == 0 ? info.id = "green" : info.id = "blue";

    localStorage.setItem("id", info.id);
    localStorage.setItem("day", day)

    GetLink(GetDay(day));
}

function GetDay(day){
    let today = new Date();

    switch (day){
        case 1:
            let tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return CleanDate(tomorrow.toLocaleDateString("hu-HU"));

        default:
            return CleanDate(today.toLocaleDateString("hu-HU"));
    }
}

function GetLink(day){
    fetch("https://api.allorigins.win/raw?url=https://www.vasvari.hu/p/oracserek")
    .then(response => response.text())
    .then(html => {
        // Ideiglenes DOM elem létrehozása a HTML-ből
        let doc = new DOMParser().parseFromString(html, "text/html");

        let link = Array.from(doc.querySelectorAll("a")).find(a => CleanDate(a.textContent).includes(day))

        if (link){
            info.innerHTML = `<a href="${link.href}">${link.textContent}</a>`;
        }
        else{
            info.textContent = `Nincs óracsere ezen a napon!`;
        }
        
    })
    .catch(error => info.textContent = `Hiba történt: ${error.message}`);
}

function CleanDate(date){
    return date.replaceAll(".","").replaceAll(" ","");
}
