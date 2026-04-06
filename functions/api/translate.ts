export const onRequestPost = async (context: any) => {
  try {
    const apiKey = context.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GOOGLE_TRANSLATE_API_KEY" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const payload = await context.request.json();
    const text = payload?.text;
    const source = payload?.source || "zh-TW";
    const target = payload?.target || "en";

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Invalid text payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: "text"
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      return new Response(JSON.stringify({ error: "Translate API failed", detail }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    const translated = await response.json();
    const translatedText = translated?.data?.translations?.[0]?.translatedText || "";

    return new Response(JSON.stringify({ translatedText }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Unknown translate error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
