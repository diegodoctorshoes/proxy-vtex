export default async function handler(req, res) {
    // libera CORS para qualquer origem (ou restrinja apenas para doctorshoes.com.br)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // responde a requisições OPTIONS (pré-flight)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { id } = req.query;

    try {
        const response = await fetch(
            `https://doctorshoes.vtexcommercestable.com.br/api/catalog_system/pub/products/search/?fq=productId:${id}`
        );

        if (!response.ok) {
            return res.status(response.status).json({ error: "Erro na VTEX" });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno", details: error.message });
    }
}
