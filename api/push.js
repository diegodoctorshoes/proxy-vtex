export default async function handler(req, res) {
    // CORS básico
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método não permitido. Use GET." });
    }

    try {
        const appId = process.env.ONESIGNAL_APP_ID;
        const apiKey = process.env.ONESIGNAL_API_KEY;

        // ⚠️ Verifica variáveis obrigatórias
        if (!appId || !apiKey) {
            return res.status(500).json({
                error: "Variáveis de ambiente ausentes",
                details: "Defina ONESIGNAL_APP_ID e ONESIGNAL_API_KEY no painel da Vercel",
            });
        }

        const payload = {
            app_id: appId,
            template_id: "3cbca2af-6d34-4814-a2a8-ae14cb97c95a",
            included_segments: ["All"],
        };

        // Usa fetch nativo da Vercel (sem axios)
        const response = await fetch("https://api.onesignal.com/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                Authorization: `Basic ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Erro ao enviar push",
                details: data,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Push enviado com sucesso!",
            data,
        });
    } catch (error) {
        console.error("Erro ao enviar push:", error);
        return res.status(500).json({
            error: "Erro interno do servidor",
            details: error.message,
        });
    }
}