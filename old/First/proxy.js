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
        const pdfUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        const pdfResponse = await fetch(pdfUrl);
        const buffer = await pdfResponse.arrayBuffer();

        // 5️⃣ PDF feldolgozás
        const data = await pdf(Buffer.from(buffer));
        const lines = data.text.split("\n");

        // 6️⃣ Szűrés
        const filtered = lines.filter(line =>
        classes.some(c => line.toLowerCase().includes(c))
        );

        res.status(200).json({ rows: filtered, href: link.href});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
function CleanDate(date){
    return date.replaceAll(".","").replaceAll(" ","");
}
