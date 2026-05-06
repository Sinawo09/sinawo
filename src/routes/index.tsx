import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search, Sparkles } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import type { AssistantTool } from "@/lib/streamAssistant";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "FlowDesk — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Generate professional emails, summarize meeting notes, plan your day, and research smarter — all powered by AI.",
      },
      { property: "og:title", content: "FlowDesk — AI Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Save hours with AI-powered email writing, meeting summaries, task planning, and research.",
      },
    ],
  }),
});

type ToolDef = {
  id: AssistantTool;
  label: string;
  short: string;
  title: string;
  description: string;
  placeholder: string;
  cta: string;
  icon: React.ReactNode;
  examples: { label: string; value: string }[];
};

const TOOLS: ToolDef[] = [
  {
    id: "email",
    label: "Email Generator",
    short: "Write emails",
    title: "Smart Email Generator",
    description: "Draft professional emails with the right tone for any audience.",
    placeholder:
      "Describe the email you need.\n\nExample: Write a polite follow-up to a client who hasn't responded to my proposal in 5 days. Tone: professional but warm.",
    cta: "Generate email",
    icon: <Mail className="h-5 w-5" />,
    examples: [
      {
        label: "Follow-up to client",
        value:
          "Write a polite follow-up email to a client named Sarah who hasn't responded to my proposal in 5 days. Mention I'm happy to jump on a quick call. Tone: warm and professional.",
      },
      {
        label: "Decline meeting",
        value:
          "Write an email declining a meeting invite from my manager next Tuesday — I have a conflicting deadline. Suggest Wednesday afternoon instead. Tone: respectful.",
      },
      {
        label: "Team announcement",
        value:
          "Write an internal announcement to my team about a new design review process starting Monday. Highlight benefits and where to find the doc. Tone: upbeat.",
      },
    ],
  },
  {
    id: "summarize",
    label: "Meeting Summarizer",
    short: "Summarize notes",
    title: "Meeting Notes Summarizer",
    description: "Turn long notes into key points, decisions, and action items.",
    placeholder:
      "Paste your raw meeting notes or transcript here.\n\nThe assistant will extract the summary, decisions, and action items with owners and deadlines.",
    cta: "Summarize notes",
    icon: <FileText className="h-5 w-5" />,
    examples: [
      {
        label: "Sample standup notes",
        value:
          "Standup — Tuesday\n- Alex shipped the new onboarding flow yesterday, monitoring metrics today.\n- Priya blocked on API auth issue, needs help from backend by EOW.\n- We agreed to move the design review from Thursday to Friday 2pm.\n- Decision: cut the avatar uploads feature from v1, ship without it.\n- Action: Jordan to draft release notes by Wed. Sam to prep the demo for Friday.\n- Discussion about Q3 OKRs — revisit next week with Maria.",
      },
    ],
  },
  {
    id: "planner",
    label: "Task Planner",
    short: "Plan my day",
    title: "AI Task Planner",
    description: "Get a prioritized schedule with realistic time blocks.",
    placeholder:
      "List your tasks and goals for today or this week. Add deadlines and effort estimates if you can.\n\nExample:\n- Finish Q3 report (due Friday, ~3h)\n- Reply to client emails (~30m)\n- Prep for 1:1 with manager at 3pm\n- Learn new analytics tool",
    cta: "Plan my day",
    icon: <ListChecks className="h-5 w-5" />,
    examples: [
      {
        label: "Busy workday",
        value:
          "Plan my day. Tasks:\n- Finish Q3 sales report (due tomorrow, ~3h deep work)\n- Reply to 12 client emails (~45m)\n- 1:1 with manager at 3pm (30m)\n- Review pull request from Maria (~30m)\n- Learn the basics of Looker (~1h, not urgent)\n- Prep slides for Friday demo (~1.5h)",
      },
    ],
  },
  {
    id: "research",
    label: "Research Assistant",
    short: "Research topic",
    title: "Research Assistant",
    description: "Distill complex info into clear findings and recommendations.",
    placeholder:
      "Paste an article, report, or describe a topic to research.\n\nExample: Summarize the pros and cons of async-first remote work for engineering teams.",
    cta: "Summarize & advise",
    icon: <Search className="h-5 w-5" />,
    examples: [
      {
        label: "Async-first work",
        value:
          "Summarize the pros and cons of async-first remote work for a 30-person engineering team. Provide recommendations on when to adopt it and what to watch out for.",
      },
      {
        label: "OKRs vs KPIs",
        value:
          "Explain the difference between OKRs and KPIs. When should a startup use one vs the other? Provide concrete recommendations.",
      },
    ],
  },
];

function Index() {
  const [active, setActive] = useState<AssistantTool>("email");
  const tool = TOOLS.find((t) => t.id === active)!;

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--gradient-subtle)" }}
    >
      {/* Mesh gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-70"
        style={{ background: "var(--gradient-mesh)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FlowDesk</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                AI productivity assistant
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-card border border-border/60 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            AI online
          </span>
        </header>

        {/* Hero */}
        <section className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-accent text-accent-foreground border border-border/60 mb-4">
            Save hours every week
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Your smart
            <span
              className="bg-clip-text text-transparent ml-2"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              workplace assistant
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Generate emails, summarize meetings, plan your day, and research
            anything — in seconds, not hours.
          </p>
        </section>

        {/* Tool tabs */}
        <nav className="mb-6">
          <div className="flex flex-wrap gap-2 p-1.5 bg-card border border-border/60 rounded-2xl shadow-[var(--shadow-sm)] w-fit mx-auto">
            {TOOLS.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  style={
                    isActive
                      ? { background: "var(--gradient-primary)" }
                      : undefined
                  }
                  type="button"
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.short}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Workspace */}
        <ToolWorkspace
          key={tool.id}
          tool={tool.id}
          title={tool.title}
          description={tool.description}
          placeholder={tool.placeholder}
          examples={tool.examples}
          ctaLabel={tool.cta}
          icon={tool.icon}
        />

        <footer className="text-center text-xs text-muted-foreground mt-12 pt-8 border-t border-border/60">
          Built with Lovable AI · Always verify critical decisions before acting on AI output.
        </footer>
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
}
