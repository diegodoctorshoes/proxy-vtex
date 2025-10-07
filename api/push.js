import http from "http";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    // Permitir CORS (caso o endpoint seja chamado do navegador)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Requisição de pré-verificação (CORS preflight)
    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === "/psuh" && req.method === "POST") {
        try {
            let body = "";

            req.on("data", chunk => {
                body += chunk.toString();
            });

            req.on("end", async () => {
                const data = body ? JSON.parse(body) : {};

                const payload = {
                    app_id: process.env.ONESIGNAL_APP_ID,
                    template_id: "3cbca2af-6d34-4814-a2a8-ae14cb97c95a",
                    included_segments: ["All"],
                };

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

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        success: true,
                        message: "Push enviado com sucesso!",
                        data: response.data,
                    })
                );
            });
        } catch (error) {
            console.error("Erro ao enviar push:", error.response?.data || error.message);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    success: false,
                    error: error.response?.data || error.message,
                })
            );
        }
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Endpoint não encontrado" }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
