import pdf from "pdf-parse";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    const { date, classP } = req.query;

    if (!date || !classP) {
        return res.status(400).json({ error: "Hiányzó paraméter" });
    }

    const classes = classP
        .toLowerCase()
        .split(",")
        .map(c => c.trim());

    try {
        const response = await fetch("https://www.vasvari.hu/p/oracserek");
        const html = await response.text();

        const doc = new JSDOM(html).window.document;
        const link = Array.from(doc.querySelectorAll("a"))
            .find(a => CleanDate(a.textContent).includes(date));
        
        let fileId;

        if (link){         
            const idMatch = link.href.match(/\/d\/([^/]+)/);
                if (idMatch) {
                    fileId = idMatch[1];
                }
                else{
                    return res.status(404).json({ error: `Rossz fileID: ${fileId}` });
                }
        }
        else{
            return res.status(404).json({ error: "Nincs PDF." });
        }

        // 4️⃣ PDF letöltése
        const pdfResponse = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
        const buffer = await pdfResponse.arrayBuffer();

        let CONTENT = [];
        let tempContent = [];
        let currentY = 0;
        let ovolt = false
        const options = {
            pagerender: async function(pageData) { //ezzel lehet koordinátákat lekérni
                const textContent = await pageData.getTextContent();
                textContent.items.forEach(item => {
                    const y = Math.round(item.transform[5]);
                    if (y != currentY) { // ha új sor következik
                        if (y+5 >= currentY && y-5 <= currentY) { // ha nem olyan nagy az eltérés, ne nézze
                            //semmi, ez így marad
                        } else{
                            ovolt = false;
                            currentY = y;
                            CONTENT.push(tempContent)
                            tempContent = [];
                        }

                    }
                    try {
                        if (item.str == "ő") { // az ő betűt különszedi a program
                            ovolt = true
                            tempContent[tempContent.length - 1] = tempContent[tempContent.length - 1].replace(/\[.*?\]/g, "")+"ő" //hozzáadja az előzőhöz az ő betűt
                        } else if (tempContent[tempContent.length - 1] == "Ő") {
                            tempContent[tempContent.length - 1] += item.str;
                            
                        } else {
                            if (ovolt) {tempContent[tempContent.length - 1] = tempContent[tempContent.length - 1].replace(/\[.*?\]/g, "", "")+item.str; ovolt = false;} // ha van még folytatás az ő után (általában jegyzetek)
                            else {tempContent.push(item.str)}
                            
                        }
                        tempContent[tempContent.length - 1] += "["+Judge(item.transform[4])+"]"; // ítélet hozzácsatolása
                    } catch {}

                });
                return "";
            }
        };


        await pdf(buffer, options);
        CONTENT.push(tempContent) // az utolsó sor hozzáadása
        CONTENT = CONTENT.filter(lol=>{
            const rowString = lol.join(" ").toLowerCase();
            return rowString.includes(classes[0] || classes[1])
        })
        res.status(200).json({ CONTENT, href: link.href });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

function CleanDate(date){
    return date.replaceAll(".","").replaceAll(" ","");
}

function Judge(x) {
            // KOORDINÁTÁK
            // 149: hanyadik óra

            // : dátum (hová került)
            // 519: óra (hová került)
            // 568: dátum (honnan került)
            // 630: óra (honnan került)
            // ]677; 690[: terem (alap)
            // ]741; 759[: terem (csere)
            // ]128; 135[: típus
    if (x < 135 && x > 128) {
        return "típus"
    } else if (x > 140 && x < 150) {
        return "hanyadik"
    } else if (x > 450 && x < 460) {
        return "D_hova"
    } else if (x > 510 && x < 520) {
        return "O_hova"
    } else if (x > 560 && x < 570) {
        return "D_honnan"
    } else if (x > 615 && x < 635) {
        return "O_honnan"
    } else if (x > 677 && x < 690) {
        return "A_terem"
    } else if (x > 741 && x < 759) {
        return "CS_terem"
    } else if (x > 150 && x < 220 ) {
        return "osztály"
    } else if (x > 230 && x < 260) {
        return "A_óra"
    } else if (x > 300 && x < 330) {
        return "T_óra"
    } else if (x>40 && x < 100) {
        return "A_tanár"
    } else if (x>360 && x < 400){
        return "F_tanár"
    } else {
        return "jegyzet"
    }
}
