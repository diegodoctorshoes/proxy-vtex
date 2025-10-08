export default async function handler(req, res) {
    // libera CORS para qualquer origem (ou restrinja apenas para doctorshoes.com.br)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Parâmetro 'id' é obrigatório" });

    const lojas = {
        matriz: "https://doctorshoes.vtexcommercestable.com.br",
        filial1: "https://doctorshoesloja1.vtexcommercestable.com.br",
        filial2: "https://doctorshoes2.vtexcommercestable.com.br",
        filial3: "https://doctorshoes3.vtexcommercestable.com.br"
    };

    try {
        // Busca os dados em todas as lojas em paralelo
        const results = await Promise.all(
            Object.entries(lojas).map(async ([loja, url]) => {
                const response = await fetch(`${url}/api/catalog_system/pub/products/search/?fq=productId:${id}`);
                if (!response.ok) throw new Error(`Erro ao consultar ${loja}`);
                const data = await response.json();
                return { loja, data };
            })
        );

        // Extrai as variações de SKU (tamanhos) e disponibilidade
        const produtoBase = results[0].data[0];
        const produtoNome = produtoBase?.productName || "Produto não encontrado";
        const estoqueFinal = {};

        // percorre cada variação (SKU)
        produtoBase.items.forEach((item) => {
            const tamanho = item.Tamanho?.[0] || item.name || "Desconhecido";
            estoqueFinal[tamanho] = {};
        });

        // percorre lojas e marca disponibilidade
        for (const { loja, data } of results) {
            const produto = data[0];
            if (!produto) continue;

            produto.items.forEach((item) => {
                const tamanho = item.Tamanho?.[0] || item.name || "Desconhecido";
                const disponivel = item.sellers?.[0]?.commertialOffer?.AvailableQuantity > 0;
                estoqueFinal[tamanho][loja] = disponivel ? "disponível" : "indisponível";
            });
        }

        return res.status(200).json({
            produto: produtoNome,
            estoque: estoqueFinal
        });

    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        return res.status(500).json({ error: "Erro interno", details: error.message });
    }
}