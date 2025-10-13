export default async function handler(req, res) {
  // ===== CONFIGURAÇÕES DE CORS =====
  res.setHeader("Access-Control-Allow-Origin", "https://www.doctorshoes.com.br");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ===== PARÂMETROS =====
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID do produto é obrigatório" });

  // ===== CACHE (Importante para reduzir FOT) =====
  res.setHeader(
    "Cache-Control",
    "s-maxage=300, stale-while-revalidate=600"
  );
  // s-maxage=300 → cache de 5min na Edge  
  // stale-while-revalidate=600 → entrega cache antigo por até 10min enquanto revalida

  try {
    // ===== VERIFICAÇÃO DE CACHE LOCAL (em memória) =====
    // Ideal usar Redis ou KV (ex: Upstash) se quiser cache persistente.
    global.cache = global.cache || new Map();
    const cacheKey = `product_${id}`;
    if (global.cache.has(cacheKey)) {
      const cached = global.cache.get(cacheKey);
      // se tiver menos de 5 minutos, retorna do cache
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return res.status(200).json(cached.data);
      }
    }

    // ===== REQUISIÇÃO VTEX =====
    const response = await fetch(
      `https://doctorshoes.vtexcommercestable.com.br/api/catalog_system/pub/products/search/?fq=productId:${id}`,
      { next: { revalidate: 300 } } // ajuda a Vercel a entender a política de cache
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erro na VTEX" });
    }

    const data = await response.json();

    // ===== SALVA NO CACHE LOCAL =====
    global.cache.set(cacheKey, { data, timestamp: Date.now() });

    // ===== RETORNA =====
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno", details: error.message });
  }
}
