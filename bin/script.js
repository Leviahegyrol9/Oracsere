const result = document.querySelector("span");

if (localStorage.getItem("index")){
    const index = parseInt(localStorage.getItem("index"));

    SetColor(index);

    GetLink(GetDay(index));
}
else{
    result.textContent = "Nincs adat!";
}

function ClickBtn(index){
    SetColor(index);

    localStorage.setItem("index", index);

    GetLink(GetDay(index));
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

function GetLink(day){
    fetch("https://api.allorigins.win/raw?url=https://www.vasvari.hu/p/oracserek")
    .then(response => {
        if (!response.ok){
            result.textContent = `Hiba: ${response.status} - ${response.statusText}`;
            throw new Error("HTTP hiba");
        }
        return response.text();
    })
    .then(html => {
        // Ideiglenes DOM elem létrehozása a HTML-ből
        let doc = new DOMParser().parseFromString(html, "text/html");

        let link = Array.from(doc.querySelectorAll("a")).find(a => CleanDate(a.textContent).includes(day))

        if (link){
            result.innerHTML = `<a href="${link.href}">${link.textContent}</a>`;
        }
        else{
            result.textContent = `Nincs óracsere ezen a napon!`;
        }
        
    })
    .catch(error => result.textContent = `Hiba történt: ${error.message}`);
}

function CleanDate(date){
    return date.replaceAll(".","").replaceAll(" ","");
}

function SetColor(index){
    const buttons = document.querySelectorAll("button");

    buttons.forEach(button => button.id = "")

    buttons[index].id = "active";
}