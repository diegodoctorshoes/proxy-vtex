import { createClient } from "redis";

let redisClient;

async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            username: "default",
            password: "kauceCNbbM3aPfsAOEDwDRn1nUi7yOOW",
            socket: {
                host: "redis-19816.c73.us-east-1-2.ec2.redns.redis-cloud.com",
                port: 19816,
            },
        });

        redisClient.on("error", (err) => console.error("Redis error:", err));

        if (!redisClient.isOpen) await redisClient.connect();
    }

    return redisClient;
}

export default async function handler(req, res) {
    // ===== CONFIGURAÇÕES DE CORS =====
    res.setHeader("Access-Control-Allow-Origin", "https://www.doctorshoes.com.br");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID do produto é obrigatório" });

    // ===== CACHE DE EDGE (vercel) =====
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    try {
        const redis = await getRedisClient();
        const cacheKey = `product:${id}`;

        // ===== VERIFICA CACHE NO REDIS =====
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`🔵 Servindo produto ${id} do cache Redis`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        // ===== REQUISIÇÃO VTEX =====
        const response = await fetch(
            `https://doctorshoes.vtexcommercestable.com.br/api/catalog_system/pub/products/search/?fq=productId:${id}`
        );

        if (!response.ok) {
            return res.status(response.status).json({ error: "Erro na VTEX" });
        }

        const data = await response.json();

        // ===== SALVA NO REDIS COM TTL (Time To Live) =====
        await redis.set(cacheKey, JSON.stringify(data), {
            EX: 300, // Expira em 5 minutos
        });

        console.log(`🟢 Cache salvo para produto ${id}`);

        return res.status(200).json(data);
    } catch (error) {
        console.error("Erro:", error);
        return res.status(500).json({ error: "Erro interno", details: error.message });
    }
}
