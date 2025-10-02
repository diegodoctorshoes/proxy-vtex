export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Informe o parâmetro ?id=" });
  }

  try {
    const response = await fetch(`https://doctorshoes.vtexcommercestable.com.br/api/catalog_system/pub/products/search/?fq=productId:${id}`);
    const data = await response.json();

    // Configura CORS para liberar chamadas do navegador
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar produto", details: error.message });
  }
}