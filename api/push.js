import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/push", async (req, res) => {
    try {
        const { ONESIGNAL_APP_ID, ONESIGNAL_API_KEY } = process.env;

        const payload = {
            app_id: ONESIGNAL_APP_ID,
            template_id: "3cbca2af-6d34-4814-a2a8-ae14cb97c95a",
            included_segments: ["All"],
        };

        const response = await axios.post(
            "https://api.onesignal.com/notifications",
            payload,
            {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Authorization: `Basic ${ONESIGNAL_API_KEY}`,
                },
            }
        );

        console.log("Push enviado:", response.data);
        res.status(200).json({
            success: true,
            message: "Push enviado com sucesso!",
            data: response.data,
        });
    } catch (error) {
        console.error("Erro ao enviar push:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data || error.message,
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
});
