export const config = {
  runtime: "edge", // executa na Edge Network da Vercel
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Cabeçalhos CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

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
    const vtexUrl = `https://doctorshoes.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=H:${id}&O=OrderByTopSaleDESC`;

    const response = await fetch(vtexUrl, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 900 }, // cache HTTP de 15 minutos (Edge)
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Erro na VTEX" }),
        { status: response.status, headers }
      );
    }

    const data = await response.json();

    // Configura cache HTTP no nível da CDN da Vercel
    headers["Cache-Control"] =
      "public, s-maxage=600, stale-while-revalidate=300";

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Erro interno", details: error.message }),
      { status: 500, headers }
    );
  }
}
