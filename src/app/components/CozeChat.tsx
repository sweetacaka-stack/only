"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CozeChatProps {
  botId: string;
  apiKey: string;
}

export default function CozeChat({ botId, apiKey }: CozeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "你好！有什么我可以帮助你的吗？" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://api.coze.cn/v3/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          bot_id: botId,
          user_id: "web_user",
          stream: true,
          auto_save_history: false,
          additional_messages: [
            {
              role: "user",
              content: userMessage,
              content_type: "text"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "API 请求失败");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantMsgId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: "assistant",
        content: ""
      }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        let isCompleted = false;
        let finalContent = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            const eventType = line.slice(6).trim();
            if (eventType === "conversation.message.completed") {
              isCompleted = true;
            }
            continue;
          }
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.content && data.role === "assistant") {
                assistantMessage += data.content;
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              }
              if (isCompleted && data.content && data.type === "answer") {
                finalContent = data.content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }

        if (isCompleted) {
          if (finalContent) {
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMsgId
                ? { ...msg, content: finalContent }
                : msg
            ));
          }
          break;
        }
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : "请稍后再试"}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* 聊天窗口 */}
      <div
        ref={chatRef}
        className={cn(
          "fixed left-4 bottom-20 z-50 w-[calc(100vw-2rem)] max-w-sm transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{ 
          display: isOpen ? "block" : "none",
          maxHeight: "70vh"
        }}
      >
        <div className="bg-[#242424] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "70vh" }}>
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500/80" />
              <span className="text-sm text-white/80 font-medium">智能助手</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/40 hover:text-white/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(70vh - 130px)" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-white/10 text-white/90"
                      : "bg-white/5 text-white/80"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-[#1a1a1a]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                disabled={isLoading}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed left-4 bottom-4 z-[60] w-12 h-12 rounded-full bg-[#242424] border border-white/10 shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-[#2d2d2d] hover:scale-105",
          isOpen && "bg-white/10"
        )}
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  );
}
