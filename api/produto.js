export const config = {
  runtime: "edge", // executa na Edge Network da Vercel
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const headers = {
    "Access-Control-Allow-Origin": "*", // pode restringir a doctorshoes.com.br se quiser
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // responde a requisições OPTIONS (pré-flight)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Parâmetro 'id' é obrigatório." }),
      { status: 400, headers }
    );
  }

  try {
    const vtexUrl = `https://doctorshoes.vtexcommercestable.com.br/api/catalog_system/pub/products/search/?fq=productId:${id}`;

    // cache de 1 hora (3600 segundos)
    const response = await fetch(vtexUrl, {
      next: { revalidate: 3600 }, // revalida a cada 1 hora
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Erro na VTEX" }),
        { status: response.status, headers }
      );
    }

    const data = await response.json();

    // cache HTTP da CDN por 1 hora + 10 min de stale
    headers["Cache-Control"] =
      "public, s-maxage=3600, stale-while-revalidate=600";

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Erro interno", details: error.message }),
      { status: 500, headers }
    );
  }
}
