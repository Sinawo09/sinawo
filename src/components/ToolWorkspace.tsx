import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Loader2, Sparkles, Square, RotateCcw } from "lucide-react";
import { streamAssistant, type AssistantTool } from "@/lib/streamAssistant";

interface Props {
  tool: AssistantTool;
  title: string;
  description: string;
  placeholder: string;
  examples: { label: string; value: string }[];
  ctaLabel: string;
  icon: React.ReactNode;
}

export function ToolWorkspace({
  tool,
  title,
  description,
  placeholder,
  examples,
  ctaLabel,
  icon,
}: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!input.trim() || loading) return;
    setOutput("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let acc = "";
    await streamAssistant({
      tool,
      input,
      signal: controller.signal,
      onDelta: (c) => {
        acc += c;
        setOutput(acc);
      },
      onDone: () => setLoading(false),
      onError: (msg) => {
        setLoading(false);
        toast.error(msg);
      },
    });
  };

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const reset = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input panel */}
      <Card className="p-6 border-border/60 shadow-[var(--shadow-md)]">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="min-h-[220px] resize-y text-sm"
        />

        {examples.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Try an example:
            </p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setInput(ex.value)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors border border-border/60"
                  type="button"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-5">
          {!loading ? (
            <Button onClick={run} disabled={!input.trim()} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {ctaLabel}
            </Button>
          ) : (
            <Button onClick={stop} variant="destructive" className="gap-2">
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
          <Button
            onClick={reset}
            variant="ghost"
            disabled={loading || (!input && !output)}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Output panel */}
      <Card className="p-6 border-border/60 shadow-[var(--shadow-md)] min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Result
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={copy}
            disabled={!output}
            className="gap-2"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
        </div>

        {!output && !loading && (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <div
                className="mx-auto mb-3 h-12 w-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--gradient-mesh)" }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm">Your AI-generated response will appear here.</p>
            </div>
          </div>
        )}

        {loading && !output && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Thinking…</span>
          </div>
        )}

        {output && (
          <div className="ai-prose flex-1 overflow-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
            {loading && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse align-middle ml-0.5" />
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground/80 mt-4 pt-4 border-t border-border/60">
          AI can make mistakes. Verify important details before acting on them.
        </p>
      </Card>
    </div>
  );
}
