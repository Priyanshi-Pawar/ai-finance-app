import { useState } from "react";

function AIChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋 I am your AI Finance Assistant. Ask me about your investments or spending patterns.",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input },
      {
        role: "assistant",
        content: "Based on your financial data, I suggest increasing your SIP allocation by 5% this quarter.",
      },
    ];

    setMessages(newMessages);
    setInput("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col h-[500px]">

      <h2 className="text-lg font-semibold mb-4 tracking-wide">
        AI Financial Insights
      </h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[75%] text-sm ${
              msg.role === "user"
                ? "bg-primary text-white self-end ml-auto"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your portfolio..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          className="bg-primary text-white px-5 rounded-lg hover:opacity-90 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AIChatPanel;