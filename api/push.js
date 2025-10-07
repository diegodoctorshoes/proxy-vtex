import axios from "axios";

export default async function handler(req, res) {
    // libera CORS para qualquer origem (ou restrinja apenas para doctorshoes.com.br)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // responde a requisições OPTIONS (pré-flight)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // só permite método GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Método não permitido. Use GET." });
    }

    try {
        // monta o payload do push
        const payload = {
            app_id: process.env.ONESIGNAL_APP_ID,
            template_id: "3cbca2af-6d34-4814-a2a8-ae14cb97c95a",
            included_segments: ["All"], // envia para todos os inscritos
        };

        // faz a requisição para o OneSignal
        const response = await axios.post(
            "https://api.onesignal.com/notifications",
            payload,
            {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Push enviado com sucesso!",
            data: response.data,
        });
    } catch (error) {
        console.error("Erro ao enviar push:", error.response?.data || error.message);

        return res.status(500).json({
            error: "Erro ao enviar push",
            details: error.response?.data || error.message,
        });
    }
}
