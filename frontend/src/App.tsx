import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const API_URL = "http://localhost:3000/chat";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(
        "Couldn't reach the assistant. Check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>Automotive AI Assistant</div>
        <div style={styles.headerSubtitle}>
          Ask about a vehicle, a booking, or a service request
        </div>
      </div>

      <div style={styles.chatWindow}>
        {messages.length === 0 && !loading && (
          <div style={styles.emptyState}>
            Try: "What's the price of the XUV700?" or "Check my booking
            MAH-9921"
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.bubbleRow,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={
                m.role === "user" ? styles.userBubble : styles.assistantBubble
              }
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubbleRow, justifyContent: "flex-start" }}>
            <div style={styles.assistantBubble}>
              <span style={styles.typingDot} />
              <span style={{ ...styles.typingDot, animationDelay: "0.15s" }} />
              <span style={{ ...styles.typingDot, animationDelay: "0.3s" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={styles.button}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    // margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: "#1a1a1a",
    background: "#fafaf9",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e0da",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6b6a64",
    marginTop: 4,
  },
  chatWindow: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  emptyState: {
    color: "#8a8880",
    fontSize: 14,
    marginTop: 40,
    textAlign: "center",
  },
  bubbleRow: {
    display: "flex",
  },
  userBubble: {
    background: "#26262a",
    color: "#fafaf9",
    padding: "10px 14px",
    borderRadius: 10,
    maxWidth: "75%",
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  assistantBubble: {
    background: "#fff",
    border: "1px solid #e2e0da",
    padding: "10px 14px",
    borderRadius: 10,
    maxWidth: "75%",
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  typingDot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#8a8880",
    marginRight: 4,
    animation: "blink 1.2s infinite",
  },
  errorBanner: {
    margin: "0 24px",
    padding: "8px 12px",
    fontSize: 13,
    color: "#a3352a",
    background: "#fbeae7",
    borderRadius: 8,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "16px 24px 24px",
    borderTop: "1px solid #e2e0da",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: 14,
    border: "1px solid #d4d2ca",
    borderRadius: 8,
    outline: "none",
    background: "#fff",
  },
  button: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 500,
    color: "#fafaf9",
    background: "#26262a",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default App;
