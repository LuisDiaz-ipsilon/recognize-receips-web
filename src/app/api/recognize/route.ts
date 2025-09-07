export const runtime = "nodejs";

function j(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  console.log('aqui')
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;
    const idclientIn = "1c06df3b-3eae-4bbf-9ea3-aa2b216b5d30"; // String(form.get("idclient") 

    if (!file) return j(400, { error: "Falta la imagen" });

    const ab = await file.arrayBuffer();
    const imageBase64 = Buffer.from(ab).toString("base64");

    const payload = {
      idclient: idclientIn,
      imageBase64,
    };

    const routeBackEnd = process.env.UPSTREAM_URL;
    if (!routeBackEnd) return j(500, { error: "Ruta no configurada para consumo de api" });

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const res = await fetch(routeBackEnd+'/process', {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();

    return j(res.status, typeof data === "string" ? { message: data } : data);
  } catch (e: any) {
    console.log(e);
    return j(500, { error: "Fallo interno", message: String(e?.message || e) });
  }
}
