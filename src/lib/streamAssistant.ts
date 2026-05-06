const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`;

export type AssistantTool = "email" | "summarize" | "planner" | "research";

export async function streamAssistant({
  tool,
  input,
  signal,
  onDelta,
  onDone,
  onError,
}: {
  tool: AssistantTool;
  input: string;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}) {
  try {
    const resp = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ tool, input }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      let msg = `Request failed (${resp.status})`;
      try {
        const j = await resp.json();
        if (j?.error) msg = j.error;
      } catch {}
      if (resp.status === 429) msg = "Rate limit reached. Please wait a moment and try again.";
      if (resp.status === 402) msg = "AI credits exhausted. Add funds to keep going.";
      onError(msg);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line || line.startsWith(":")) continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    onError(e instanceof Error ? e.message : "Unknown error");
  }
}
