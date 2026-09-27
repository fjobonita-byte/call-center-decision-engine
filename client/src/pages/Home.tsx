import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Code2,
  Command,
  Headphones,
  HelpCircle,
  Inbox,
  Layers3,
  LifeBuoy,
  MessageSquareText,
  PanelRight,
  Play,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";

type FlowNode = {
  title: string;
  script: string;
  options: { label: string; next: string; tone?: "primary" | "warning" | "muted" }[];
};

type FlowData = Record<string, FlowNode>;

const defaultFlow: FlowData = {
  start: {
    title: "Initial customer contact",
    script: "Thank you for calling support. May I have your account ID or phone number?",
    options: [
      { label: "Account found / verified", next: "account_verified", tone: "primary" },
      { label: "Account not found / new customer", next: "new_customer", tone: "muted" },
    ],
  },
  account_verified: {
    title: "Select issue category",
    script: "How can I assist you with your account today?",
    options: [
      { label: "Billing inquiry", next: "billing_flow", tone: "primary" },
      { label: "Technical support", next: "tech_flow", tone: "primary" },
      { label: "Request escalation", next: "escalate_supervisor", tone: "warning" },
    ],
  },
  new_customer: {
    title: "New customer setup",
    script: "I can help you set up a new account today. Would you like to proceed?",
    options: [
      { label: "Yes — start registration", next: "start", tone: "primary" },
      { label: "No — general information only", next: "start", tone: "muted" },
    ],
  },
  billing_flow: {
    title: "Billing assistance",
    script: "Review recent transactions in the CRM and confirm the payment method on file.",
    options: [
      { label: "Issue resolved", next: "start", tone: "primary" },
      { label: "Requires supervisor approval", next: "escalate_supervisor", tone: "warning" },
    ],
  },
  tech_flow: {
    title: "Technical troubleshooting",
    script: "Walk the customer through step 1: restart equipment and check connection indicators.",
    options: [
      { label: "Resolved", next: "start", tone: "primary" },
      { label: "Unresolved — dispatch technician", next: "start", tone: "warning" },
    ],
  },
  escalate_supervisor: {
    title: "Escalate to supervisor",
    script: "Transfer the caller to the active escalation tier or create a high-priority supervisor ticket.",
    options: [{ label: "Transfer complete", next: "start", tone: "primary" }],
  },
};

const jsonSeed = JSON.stringify(defaultFlow, null, 2);

function IconBadge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "amber" | "green" }) {
  return <span className={`icon-badge ${tone}`}>{children}</span>;
}

export default function Home() {
  const [flowData, setFlowData] = useState<FlowData>(defaultFlow);
  const [jsonValue, setJsonValue] = useState(jsonSeed);
  const [currentStepId, setCurrentStepId] = useState("start");
  const [history, setHistory] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(true);
  const [search, setSearch] = useState("");
  const [isLive, setIsLive] = useState(true);

  const currentStep = flowData[currentStepId] ?? flowData.start;
  const stepCount = Object.keys(flowData).length;
  const progress = Math.min(100, Math.round(((history.length + 1) / 4) * 100));
  const matchingNodes = useMemo(() => Object.entries(flowData).filter(([id, node]) => `${id} ${node.title}`.toLowerCase().includes(search.toLowerCase())), [flowData, search]);

  const navigate = (next: string) => {
    setHistory((items) => [...items, currentStepId]);
    setCurrentStepId(next);
  };

  const restartFlow = () => {
    setHistory([]);
    setCurrentStepId("start");
    toast.success("Workflow reset", { description: "Ready for the next customer interaction." });
  };

  const applyChanges = () => {
    try {
      const parsed = JSON.parse(jsonValue) as FlowData;
      if (!parsed.start || typeof parsed.start !== "object") throw new Error("Missing start node");
      setFlowData(parsed);
      setCurrentStepId("start");
      setHistory([]);
      toast.success("Process flow updated", { description: `${Object.keys(parsed).length} nodes are now live in this session.` });
    } catch {
      toast.error("Couldn’t apply changes", { description: "Check the JSON syntax and make sure a start node exists." });
    }
  };

  const loadDefault = () => {
    setJsonValue(jsonSeed);
    setFlowData(defaultFlow);
    setCurrentStepId("start");
    setHistory([]);
    toast("Default process restored");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Headphones size={18} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">signal<span>/</span>ops</div>
            <div className="brand-subtitle">CX OPERATIONS SUITE</div>
          </div>
        </div>
        <div className="topbar-center"><span className="status-dot" /> Decision engine <span className="divider-dot">·</span> v2.4.1</div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Help"><CircleHelp size={17} /></button>
          <button className="icon-button" aria-label="Settings"><Settings2 size={17} /></button>
          <div className="avatar">AM</div>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-section-label">WORKSPACE</div>
          <nav className="side-nav">
            <button className="side-link active"><Layers3 size={16} /> Decision assistant <span className="side-count">01</span></button>
            <button className="side-link"><Inbox size={16} /> Queue overview</button>
            <button className="side-link"><ClipboardCheck size={16} /> QA checklist</button>
          </nav>
          <div className="sidebar-section-label flow-label">CURRENT FLOW</div>
          <div className="flow-search"><Search size={14} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a node" /></div>
          <div className="node-list">
            {matchingNodes.map(([id, node], index) => (
              <button key={id} className={`node-item ${id === currentStepId ? "selected" : ""}`} onClick={() => setCurrentStepId(id)}>
                <span className={`node-index ${id === currentStepId ? "current" : ""}`}>{String(index + 1).padStart(2, "0")}</span>
                <span className="node-copy"><strong>{node.title}</strong><small>{id.replaceAll("_", " ")}</small></span>
                {id === currentStepId && <span className="node-live" />}
              </button>
            ))}
          </div>
          <div className="sidebar-footer"><ShieldCheck size={14} /> All changes are local to this session</div>
        </aside>

        <main className="main-pane">
          <div className="page-heading">
            <div><div className="eyebrow"><Zap size={13} /> LIVE CALL GUIDANCE</div><h1>Agent decision assistant</h1><p>Follow the verified path for a consistent, compliant customer experience.</p></div>
            <div className="heading-actions"><button className="ghost-button" onClick={restartFlow}><RotateCcw size={15} /> Reset</button><button className="primary-button" onClick={() => toast.success("Session saved", { description: "The current workflow position has been saved locally." })}><Save size={15} /> Save session</button></div>
          </div>

          <div className="metric-row">
            <div className="metric-card"><IconBadge tone="blue"><Play size={15} /></IconBadge><div><small>SESSION STATUS</small><strong>{isLive ? "In progress" : "Paused"}</strong></div><button className={`live-toggle ${isLive ? "on" : ""}`} onClick={() => setIsLive(!isLive)}><span /></button></div>
            <div className="metric-card"><IconBadge tone="amber"><Layers3 size={15} /></IconBadge><div><small>ACTIVE NODE</small><strong>{String(history.length + 1).padStart(2, "0")} / {String(stepCount).padStart(2, "0")}</strong></div></div>
            <div className="metric-card"><IconBadge tone="green"><ShieldCheck size={15} /></IconBadge><div><small>COMPLIANCE</small><strong>Verified path</strong></div></div>
          </div>

          <div className="stepper"><div className="stepper-label"><span>WORKFLOW PROGRESS</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="stepper-stages"><span className="done"><Check size={11} /> Identify caller</span><span className={history.length >= 1 ? "done" : "current-stage"}>{history.length >= 1 ? <Check size={11} /> : <span className="stage-number">2</span>} Verify &amp; route</span><span className={history.length >= 2 ? "done" : ""}><span className="stage-number">3</span> Resolve issue</span><span><span className="stage-number">4</span> Close interaction</span></div></div>

          <section className="decision-card">
            <div className="decision-card-top"><div className="node-kicker"><span className="pulse-ring" /> NODE {String(history.length + 1).padStart(2, "0")} <span className="slash">/</span> {currentStepId.replaceAll("_", " ")}</div><button className="more-button" aria-label="More options"><ChevronDown size={17} /></button></div>
            <div className="decision-content"><div className="decision-icon"><MessageSquareText size={22} /></div><div><h2>{currentStep.title}</h2><p className="decision-description">Use the prompt below, then choose the outcome that best matches the customer’s response.</p></div></div>
            <div className="script-panel"><div className="script-label"><Sparkles size={14} /> SUGGESTED SCRIPT</div><p>“{currentStep.script}”</p><button className="copy-script" onClick={() => { navigator.clipboard?.writeText(currentStep.script); toast("Script copied to clipboard"); }}><Code2 size={14} /> Copy script</button></div>
            <div className="options-header"><span>CHOOSE AN OUTCOME</span><span className="options-help"><HelpCircle size={13} /> Select one to continue</span></div>
            <div className="option-grid">{currentStep.options.map((option, index) => <button key={option.label} className={`option-button ${option.tone ?? "primary"}`} onClick={() => navigate(option.next)}><span className="option-number">{String(index + 1).padStart(2, "0")}</span><span>{option.label}</span><ArrowRight size={16} /></button>)}</div>
            <div className="decision-card-footer"><span><LifeBuoy size={14} /> Need help? <button onClick={() => toast("Escalation guide", { description: "Use Request escalation when a supervisor decision is required." })}>Open escalation guide</button></span><span className="keyboard-hint"><Command size={12} /> K to search</span></div>
          </section>
          <div className="recent-note"><AlertCircle size={15} /><span>Changes to the process editor are validated before they reach the live assistant.</span><button onClick={() => setShowEditor(true)}>Review editor <ArrowRight size={14} /></button></div>
        </main>

        {showEditor && <aside className="editor-pane"><div className="editor-header"><div><div className="eyebrow editor-eyebrow"><Terminal size={13} /> ADMIN MODE</div><h2>Process configuration</h2></div><button className="icon-button editor-close" onClick={() => setShowEditor(false)} aria-label="Close editor"><X size={17} /></button></div><p className="editor-description">Edit routing logic as JSON. Changes are applied only to this session.</p><div className="editor-toolbar"><span className="file-tab"><Code2 size={13} /> flow.json</span><span className="valid-pill"><span /> JSON</span></div><div className="code-editor"><div className="line-numbers">{jsonValue.split("\n").map((_, i) => <span key={i}>{i + 1}</span>)}</div><textarea value={jsonValue} onChange={(e) => setJsonValue(e.target.value)} spellCheck={false} aria-label="Process JSON editor" /></div><div className="editor-actions"><button className="secondary-button" onClick={loadDefault}>Restore default</button><button className="apply-button" onClick={applyChanges}><Check size={15} /> Apply changes</button></div><div className="editor-footnote"><ShieldCheck size={14} /><div><strong>Safe preview mode</strong><span>Your production workflow won’t be affected.</span></div></div></aside>}
        {!showEditor && <button className="open-editor" onClick={() => setShowEditor(true)}><PanelRight size={16} /> Open editor</button>}
      </div>
    </div>
  );
}
