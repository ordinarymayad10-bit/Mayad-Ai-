
export default async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POST method required" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const token = process.env.HF_TOKEN;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "HF_TOKEN is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct:fastest",
          messages: [
            {
              role: "user",
              content: message.slice(0, 4000)
            }
          ],
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error || "AI provider request failed"
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        reply: data.choices?.[0]?.message?.content || "No response received"
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Request failed. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
