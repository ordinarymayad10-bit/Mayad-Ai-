
export default async (req) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POST request required" }),
      { status: 405, headers }
    );
  }

  const token = process.env.HF_TOKEN;

  if (!token) {
    return new Response(
      JSON.stringify({ error: "Netlify-তে HF_TOKEN সেট করা নেই" }),
      { status: 500, headers }
    );
  }

  try {
    const body = await req.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message লিখুন" }),
        { status: 400, headers }
      );
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "HuggingFaceH4/zephyr-7b-beta",
          messages: [
            { role: "user", content: message }
          ],
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error || `AI service error: ${response.status}`
        }),
        { status: 502, headers }
      );
    }

    return new Response(
      JSON.stringify({
        reply: data.choices?.[0]?.message?.content || "AI উত্তর দিতে পারেনি।"
      }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।" }),
      { status: 500, headers }
    );
  }
};
