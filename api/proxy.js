export default async function handler(req, res) {
    try {
        const response = await fetch("https://www.vasvari.hu/p/oracserek");
        const html = await response.text();

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: "Hiba történt" });
    }
}