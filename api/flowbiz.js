export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    try {
        const body = await new Promise((resolve, reject) => {
            let data = "";
            req.on("data", chunk => (data += chunk));
            req.on("end", () => resolve(data));
            req.on("error", reject);
        });

        const params = new URLSearchParams(body);
        const email = params.get("email");

        if (!email) {
            return res.status(400).json({ error: "Email é obrigatório" });
        }

        const apiKey = process.env.MAILBIZ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "MAILBIZ_API_KEY não configurada no ambiente" });
        }

        const listId ='15707';
        const apiUrl = `https://mbiz.mailclick.me/api.php/Subscriber.Subscribe?APIKey=${apiKey}&Command=Subscriber.Subscribe&ResponseFormat=JSON&JSONPCallBack=true&ListID=${listId}&EmailAddress=${encodeURIComponent(email)}&CustomField1=1&IPAddress=172.0.0.1&UpdateIfExists=true`;

        const response = await fetch(apiUrl, { method: "POST" });
        const result = await response.text();

        return res.status(200).json({
            success: true,
            email,
            lifecyclestage,
            hs_context: JSON.parse(decodeURIComponent(hs_context || "{}")),
            mailclick_response: result
        });
    } catch (error) {
        console.error("Erro:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
}
