import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

type FlowType = "events" | "workshops" | "displays" | "browse";
type NextLeadField =
  | "name"
  | "email"
  | "phone"
  | "timeframe"
  | "location"
  | "scale"
  | "budgetConstraint"
  | "brief"
  | null;

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

interface LeadDraft {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  timeframe: string;
  location: string;
  scale: string;
  brief: string;
  budgetConstraint: string;
}

interface ChatResponse {
  reply?: string;
  intent?: FlowType;
  leadMode?: boolean;
  readyNow?: boolean;
  nextLeadField?: NextLeadField;
  nextLeadQuestion?: string | null;
  suggestedReplies?: string[];
}

const PHONE = "1800 826 268";
const EMAIL = "enquiries@bloomneventsco.com.au";
const API_CHAT_URL = "/api/chat";
const API_LEAD_URL = "/api/lead";

const FLOW_SEED_PROMPTS: Record<FlowType, string> = {
  events: "I am planning a corporate event and want to discuss dates, location, guest count, and budget.",
  workshops: "I want to plan a workshop and need help with audience, duration, location, and theme.",
  displays: "I want a display or installation and need guidance on dimensions, timeline, and branding.",
  browse: "I am browsing. Show me case studies, process, service fit, and what to do next.",
};

const FLOW_MENU = [
  { label: "Events", flow: "events" as const },
  { label: "Workshops", flow: "workshops" as const },
  { label: "Displays", flow: "displays" as const },
  { label: "Just Browsing", flow: "browse" as const },
];

const ROUTE_CTA_CONFIG = [
  { href: "/workshops", label: "Open Workshops Page" },
  { href: "/events", label: "Open Events Page" },
  { href: "/displays", label: "Open Displays Page" },
  { href: "/gallery", label: "View Case Studies" },
  { href: "/capabilities", label: "View Capabilities" },
  { href: "/contact", label: "Open Contact Page" },
];

function track(eventName: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || typeof window.bloomTrack !== "function") return;
  window.bloomTrack(eventName, params);
}

function safeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeLeadValue(value: string) {
  return value.trim();
}

function getMessageRouteCta(text: string) {
  const lower = text.toLowerCase();
  return ROUTE_CTA_CONFIG.find((item) => lower.includes(item.href)) ?? null;
}

function isLeadReady(draft: LeadDraft) {
  return (
    draft.name.trim().length >= 2 &&
    draft.email.trim().length > 4 &&
    draft.phone.trim().length >= 8 &&
    draft.brief.trim().length >= 10
  );
}

function buildTranscript(messages: ChatMessage[]) {
  return messages
    .slice(-16)
    .map((message) => `${message.role === "assistant" ? "Bloom" : "Visitor"}: ${message.text}`)
    .join("\n");
}

async function submitLead(data: Record<string, unknown>) {
  const res = await fetch(API_LEAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      companyWebsite: "", // honeypot
    }),
  });

  const result = (await res.json()) as { ok?: boolean; success?: boolean };
  return Boolean(result.ok ?? result.success);
}

export default function ChatConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [bottomOffset, setBottomOffset] = useState(16);
  const [launcherHintVisible, setLauncherHintVisible] = useState(false);
  const [flow, setFlow] = useState<FlowType>("browse");
  const [leadMode, setLeadMode] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [pendingLeadSend, setPendingLeadSend] = useState(false);
  const [nextLeadField, setNextLeadField] = useState<NextLeadField>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    "Show me case studies",
    "What is your process?",
    "Start my project",
  ]);
  const [leadDraft, setLeadDraft] = useState<LeadDraft>({
    name: "",
    email: "",
    phone: "",
    projectType: "browse",
    timeframe: "",
    location: "",
    scale: "",
    brief: "",
    budgetConstraint: "",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: safeId(),
      role: "assistant",
      text: "Hey! I'm your Bloom'n event sidekick. Tell me what you're dreaming up: events, workshops, displays, or just browsing?",
    },
  ]);

  const messageViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = messageViewportRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateBottomOffset = () => {
      const nav = document.getElementById("main-navbar");
      const isHome = document.body.classList.contains("home");
      const navAtBottom = isHome && nav?.getAttribute("data-nav-pos") !== "top";
      const navHeight = nav?.offsetHeight || 72;
      setBottomOffset(navAtBottom ? navHeight + 12 : 16);
    };

    updateBottomOffset();

    const nav = document.getElementById("main-navbar");
    const navObserver = nav
      ? new MutationObserver(() => {
          updateBottomOffset();
        })
      : null;

    if (navObserver && nav) {
      navObserver.observe(nav, {
        attributes: true,
        attributeFilter: ["data-nav-pos"],
      });
    }

    window.addEventListener("resize", updateBottomOffset);
    window.addEventListener("scroll", updateBottomOffset, { passive: true });

    return () => {
      navObserver?.disconnect();
      window.removeEventListener("resize", updateBottomOffset);
      window.removeEventListener("scroll", updateBottomOffset);
    };
  }, []);

  const quickReplies = useMemo(() => {
    if (!isOpen || isLoading) return [];
    if (leadSubmitted) return [`Call ${PHONE}`, `Email ${EMAIL}`];
    if (messages.length <= 2) return FLOW_MENU.map((item) => item.label);
    return suggestedReplies.slice(0, 4);
  }, [isOpen, isLoading, leadSubmitted, messages.length, suggestedReplies]);

  function appendMessage(role: "assistant" | "user", text: string) {
    setMessages((prev) => [...prev, { id: safeId(), role, text }]);
  }

  function handleOpen() {
    setIsOpen(true);
    track("chat_widget_opened", { channel: "concierge" });
  }

  function mapReplyToFlow(reply: string): FlowType | null {
    const lower = reply.toLowerCase();
    const byLabel = FLOW_MENU.find((item) => item.label.toLowerCase() === lower);
    return byLabel?.flow ?? null;
  }

  function updateLeadDraftFromMessage(field: NextLeadField, userText: string, draft: LeadDraft) {
    if (!field) return draft;
    const clean = sanitizeLeadValue(userText);
    if (!clean) return draft;
    return {
      ...draft,
      [field]: clean,
    };
  }

  async function runChat(userText: string, nextFlow?: FlowType, leadDraftSnapshot?: LeadDraft) {
    const activeFlow = nextFlow ?? flow;
    const currentLeadDraft = leadDraftSnapshot ?? leadDraft;
    const history = messages
      .slice(-12)
      .map((item) => ({ role: item.role, content: item.text }));

    const payload = {
      message: userText,
      conversationHistory: history,
      flow: activeFlow,
      leadMode,
      leadDraft: {
        ...currentLeadDraft,
        projectType: activeFlow,
      },
    };

    const response = await fetch(API_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Chat request failed");
    }

    const data = (await response.json()) as ChatResponse;
    const assistantReply =
      data.reply ??
      "I can help with that. If it's easier, we can move straight to /contact or call 1800 826 268.";
    appendMessage("assistant", assistantReply);

    const responseIntent = data.intent ?? activeFlow;
    if (data.intent) {
      setFlow(data.intent);
    }
    setLeadDraft((prev) => ({ ...prev, projectType: responseIntent }));

    setLeadMode(Boolean(data.leadMode));
    setNextLeadField(data.nextLeadField ?? null);
    setSuggestedReplies(
      Array.isArray(data.suggestedReplies) && data.suggestedReplies.length > 0
        ? data.suggestedReplies
        : ["Show me case studies", "What is your process?", "Start my project"]
    );

    const draftReady = isLeadReady({
      ...currentLeadDraft,
      projectType: responseIntent,
    });

    if (!leadSubmitted && data.leadMode && draftReady && !data.nextLeadField) {
      setPendingLeadSend(true);
      appendMessage("assistant", "I can send this to the team now. Tap \"Send Project Brief\" below and we'll take it from there.");
    }
  }

  async function handleSend(userText: string, selectedFlow?: FlowType) {
    const text = userText.trim();
    if (!text || isLoading) return;

    const matchedFlow = selectedFlow ?? mapReplyToFlow(text) ?? undefined;
    const effectiveFlow = matchedFlow ?? flow;

    if (matchedFlow) {
      setFlow(matchedFlow);
    }

    let nextLeadDraft: LeadDraft = {
      ...leadDraft,
      projectType: effectiveFlow,
    };
    nextLeadDraft = updateLeadDraftFromMessage(nextLeadField, text, nextLeadDraft);
    setLeadDraft(nextLeadDraft);

    appendMessage("user", text);
    track("chat_message_sent", {
      flow: effectiveFlow,
      lead_mode: leadMode,
    });

    setInputValue("");
    setIsLoading(true);
    try {
      await runChat(matchedFlow ? FLOW_SEED_PROMPTS[matchedFlow] : text, matchedFlow, nextLeadDraft);
    } catch {
      appendMessage(
        "assistant",
        `I'm having trouble connecting right now. You can still reach us on ${PHONE} or ${EMAIL}.`
      );
      setSuggestedReplies([`Call ${PHONE}`, `Email ${EMAIL}`]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitLead() {
    if (leadSubmitted || isLoading) return;
    if (!isLeadReady(leadDraft)) {
      appendMessage("assistant", "Before I send this through, I still need your name, email, phone, and a short brief.");
      setLeadMode(true);
      setPendingLeadSend(false);
      return;
    }

    setIsLoading(true);
    try {
      const ok = await submitLead({
        name: leadDraft.name,
        email: leadDraft.email,
        phone: leadDraft.phone,
        projectType: leadDraft.projectType || flow,
        timeframe: leadDraft.timeframe || undefined,
        location: leadDraft.location || undefined,
        scale: leadDraft.scale || undefined,
        brief: leadDraft.brief,
        budgetConstraint: leadDraft.budgetConstraint || undefined,
        transcriptExcerpt: buildTranscript(messages),
      });

      if (ok) {
        setLeadSubmitted(true);
        setPendingLeadSend(false);
        appendMessage(
          "assistant",
          `Done. Your brief is with the team. If you'd like to fast-track, call ${PHONE} or email ${EMAIL}.`
        );
        track("chat_lead_submitted", { flow: leadDraft.projectType || flow });
      } else {
        appendMessage(
          "assistant",
          `I couldn't submit that just now. Please use /contact, call ${PHONE}, or email ${EMAIL} and we'll sort it quickly.`
        );
        track("chat_lead_submit_failed", { flow: leadDraft.projectType || flow });
      }
    } catch {
      appendMessage(
        "assistant",
        `I couldn't submit that right now. Please use /contact, call ${PHONE}, or email ${EMAIL}.`
      );
      track("chat_lead_submit_failed", { flow: leadDraft.projectType || flow });
    } finally {
      setIsLoading(false);
    }
  }

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSend(inputValue);
  }

  function handleChipClick(chip: string) {
    const lower = chip.toLowerCase();
    const routeMatch = chip.match(/\/(events|workshops|displays|contact|gallery|capabilities)\b/i);

    if (lower.startsWith("call")) {
      window.location.href = `tel:${PHONE.replace(/\s/g, "")}`;
      return;
    }
    if (lower.startsWith("email")) {
      window.location.href = `mailto:${EMAIL}`;
      return;
    }
    if (routeMatch) {
      window.location.href = routeMatch[0].toLowerCase();
      return;
    }

    const flowFromChip = mapReplyToFlow(chip) ?? undefined;
    void handleSend(chip, flowFromChip);
  }

  return (
    <div
      style={{
        position: "fixed",
        right: "16px",
        bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px))`,
        zIndex: 9998,
        width: isOpen ? "min(380px, calc(100vw - 24px))" : "auto",
      }}
      aria-live="polite"
    >
      {isOpen ? (
        <section
          aria-label="Bloom concierge chat"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "min(640px, calc(100vh - 32px))",
            borderRadius: "16px",
            border: "2px solid var(--color-gold)",
            background: "linear-gradient(180deg, #fff9ed 0%, #fffdf7 100%)",
            boxShadow: "0 18px 42px rgba(19, 20, 24, 0.3)",
            overflow: "hidden",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              background: "var(--color-charcoal)",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <img
                src="/assets/images/butterfly-icon.svg"
                alt=""
                aria-hidden="true"
                style={{ width: "30px", height: "30px", display: "block", flexShrink: 0 }}
              />
              <div>
                <strong style={{ display: "block", lineHeight: 1.2 }}>Bloom'n Concierge</strong>
                <small style={{ opacity: 0.85 }}>Sales + support sidekick</small>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                border: "none",
                background: "transparent",
                color: "#fff",
                fontSize: "1.15rem",
                cursor: "pointer",
              }}
            >
              X
            </button>
          </header>

          <div
            ref={messageViewportRef}
            style={{
              padding: "14px",
              overflowY: "auto",
              flex: 1,
              background: "rgba(255, 255, 255, 0.82)",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent: message.role === "assistant" ? "flex-start" : "flex-end",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    maxWidth: "86%",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    lineHeight: 1.45,
                    fontSize: "0.95rem",
                    whiteSpace: "pre-wrap",
                    background:
                      message.role === "assistant" ? "rgba(255, 249, 237, 0.95)" : "var(--color-charcoal)",
                    color: message.role === "assistant" ? "var(--color-gold)" : "#fff",
                    border:
                      message.role === "assistant" ? "1px solid rgba(191, 155, 48, 0.9)" : "1px solid transparent",
                  }}
                >
                  {message.text}
                  {message.role === "assistant" && (() => {
                    const cta = getMessageRouteCta(message.text);
                    if (!cta) return null;
                    return (
                      <div style={{ marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = cta.href;
                          }}
                          style={{
                            borderRadius: "999px",
                            border: "1px solid rgba(191, 155, 48, 0.9)",
                            background: "rgba(191, 155, 48, 0.2)",
                            color: "var(--color-charcoal)",
                            padding: "5px 11px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {cta.label}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ color: "var(--color-charcoal)", opacity: 0.78, fontSize: "0.9rem" }}>
                Bloom is thinking...
              </div>
            )}
          </div>

          {pendingLeadSend && (
            <div style={{ padding: "8px 12px 0 12px" }}>
              <button
                type="button"
                onClick={() => void handleSubmitLead()}
                className="btn btn-gold w-100"
                disabled={isLoading}
              >
                Send Project Brief
              </button>
            </div>
          )}

          {quickReplies.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                padding: "10px 12px 2px 12px",
              }}
            >
              {quickReplies.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={isLoading}
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgba(191, 155, 48, 0.75)",
                    background: "rgba(191, 155, 48, 0.12)",
                    color: "var(--color-charcoal)",
                    padding: "4px 10px",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onFormSubmit} style={{ padding: "10px 12px 12px 12px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={
                  leadMode && nextLeadField
                    ? "Type your answer..."
                    : "Ask anything, or say \"I want a quote\""
                }
                disabled={isLoading}
                maxLength={700}
                style={{
                  flex: 1,
                  borderRadius: "10px",
                  border: "1px solid rgba(0, 0, 0, 0.22)",
                  padding: "10px 12px",
                  fontSize: "0.92rem",
                }}
              />
              <button type="submit" className="btn btn-gold" disabled={isLoading || !inputValue.trim()}>
                Send
              </button>
            </div>
            <div style={{ marginTop: "6px", fontSize: "0.72rem", opacity: 0.78 }}>
              Need direct contact?{" "}
              <a href="/contact" style={{ fontWeight: 600 }}>
                Visit our contact page
              </a>
            </div>
          </form>
        </section>
      ) : (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "76px",
              top: "50%",
              transform: launcherHintVisible
                ? "translate(0, -50%)"
                : "translate(12px, -50%)",
              opacity: launcherHintVisible ? 1 : 0,
              transition: "opacity 180ms ease, transform 180ms ease",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              background: "rgba(255, 249, 237, 0.98)",
              color: "var(--color-gold)",
              border: "1px solid rgba(191, 155, 48, 0.9)",
              padding: "10px 12px",
              borderRadius: "14px",
              fontSize: "0.84rem",
              fontWeight: 600,
              boxShadow: "0 10px 24px rgba(19, 20, 24, 0.26)",
            }}
          >
            Chat with Bloom'n Events Co
            <span
              style={{
                position: "absolute",
                right: "-6px",
                top: "50%",
                width: "12px",
                height: "12px",
                transform: "translateY(-50%) rotate(45deg)",
                background: "rgba(255, 249, 237, 0.98)",
                borderTop: "1px solid rgba(191, 155, 48, 0.9)",
                borderRight: "1px solid rgba(191, 155, 48, 0.9)",
                borderRadius: "2px",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleOpen}
            onMouseEnter={() => setLauncherHintVisible(true)}
            onMouseLeave={() => setLauncherHintVisible(false)}
            onFocus={() => setLauncherHintVisible(true)}
            onBlur={() => setLauncherHintVisible(false)}
            aria-label="Chat with Bloom'n Events Co"
            style={{
              border: "2px solid rgba(191, 155, 48, 0.95)",
              background: "rgba(255, 249, 237, 0.98)",
              width: "68px",
              height: "68px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              margin: 0,
              lineHeight: 0,
              cursor: "pointer",
              transform: launcherHintVisible ? "scale(1.05)" : "scale(1)",
              transition: "transform 180ms ease, box-shadow 180ms ease",
              filter: "drop-shadow(0 10px 22px rgba(19, 20, 24, 0.28))",
              boxShadow: launcherHintVisible
                ? "0 0 0 3px rgba(191, 155, 48, 0.2)"
                : "0 0 0 0 rgba(191, 155, 48, 0)",
            }}
          >
            <img
              src="/assets/images/butterfly-icon.svg"
              alt=""
              aria-hidden="true"
              style={{ width: "44px", height: "44px", display: "block" }}
            />
          </button>
        </div>
      )}
    </div>
  );
}
