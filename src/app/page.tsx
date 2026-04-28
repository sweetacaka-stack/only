"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

// Coze 智能体对话组件
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CozeChatProps {
  botId: string;
  apiKey: string;
}

function CozeChat({ botId, apiKey }: CozeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "你好！有什么我可以帮助你的吗？" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  // 发送消息到 Coze API
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

      // 添加空的 assistant 消息
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
            // 检查是否完成
            if (eventType === "conversation.message.completed") {
              isCompleted = true;
            }
            continue;
          }
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5));
              // 流式输出时从 content 字段读取（不是 reasoning_content）
              if (data.content && data.role === "assistant") {
                // 累积 content 内容
                assistantMessage += data.content;
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              }
              // 保存最终的完整内容
              if (isCompleted && data.content && data.type === "answer") {
                finalContent = data.content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }

        if (isCompleted) {
          // 用完整内容替换
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
          {/* 头部 */}
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

          {/* 消息列表 */}
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

          {/* 输入框 */}
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

const works = [
  { id: 1, title: "MONOGRAPH", category: "Brand Identity", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fb2c17deea19eb100c6291198bb9c92c69235b8092dbe59ccf23c693987dc3e85.png&nonce=e6cdf224-c486-40f0-91c9-bbc87cb4feee&project_id=7628526330237288488&sign=5765c39e540e757ad689716ee1e01a67ed3f8a437cbd3c774a2d18d79734a1b8" },
  { id: 2, title: "AURA", category: "Visual Design", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0a582b534cae1df4174469b487e2c56667967c20fafeea97abc00a586baee02a.png&nonce=0111348a-bb7a-47bf-a5b4-e8e722f19205&project_id=7628526330237288488&sign=514041380476eab1bb10da905f415fa3a349bf0e55b78766c05badd8534d2b04" },
  { id: 3, title: "VOID", category: "Art Direction", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0fc3ec76c63e9c9019bbbafd74fe55acf75d5fa1428fd911391a856c9a707f4b.png&nonce=b289ae8d-88ed-4cc0-8ca9-eb6feeabfe2e&project_id=7628526330237288488&sign=2e8ee79250d9c94eb1d1286469cf68f076a8e89fbd169a89b9befe326e6b8af6" },
  { id: 4, title: "ETHEREAL", category: "Photography", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F3f3bea175ebb1d23a37de7c4805d9d998f5659cd1a272e4601e2ec740b78a904.png&nonce=d6769453-a409-4ba4-bfe0-7d0f65e4ad01&project_id=7628526330237288488&sign=1a2b34db9d831af35a99a7c95ff5602259fa5d394646eed6794a218f46d5cbc0" },
  { id: 5, title: "METRIC", category: "Data Visualization", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F4cbf9d2d2d36c6f2c2c702885afd68f8ecd66b61884f1c935083d05334cf8b62.png&nonce=ac78c54c-8d7a-4924-9f24-2d6af074ea4d&project_id=7628526330237288488&sign=733958909a9dbe6b6f1d243684c2389bd6bb6337e15da5c768f88055b363e8e7" },
  { id: 6, title: "LUMEN", category: "Installation", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fsp260415_151645.png&nonce=2b8adfc5-c944-4174-9e22-a1c97de1000e&project_id=7628526330237288488&sign=615824e13095af5cf418d8c43e4961888e0c0467f81453775e97b815dec6bd20" },
];

// 手表指针组件
function WatchHands() {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHands = () => {
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      const secondDeg = (seconds + milliseconds / 1000) * 6;
      const minuteDeg = (minutes + seconds / 60) * 6;
      const hourDeg = (hours + minutes / 60) * 30;

      if (hourRef.current) hourRef.current.style.transform = `rotate(${hourDeg}deg)`;
      if (minuteRef.current) minuteRef.current.style.transform = `rotate(${minuteDeg}deg)`;
      if (secondRef.current) secondRef.current.style.transform = `rotate(${secondDeg}deg)`;
      
      requestAnimationFrame(updateHands);
    };

    const animationId = requestAnimationFrame(updateHands);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div ref={hourRef} className="absolute w-1 h-16 bg-white/80 origin-bottom" />
      <div ref={minuteRef} className="absolute w-0.5 h-20 bg-white/60 origin-bottom" />
      <div ref={secondRef} className="absolute w-px h-24 bg-white/40 origin-bottom" />
      <div className="absolute w-2 h-2 rounded-full bg-white/90" />
    </div>
  );
}

// 电子流 Z 字母组件 - 兰顿蚂蚁线条效果
function ZLetterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const W = 800;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // 1. 建立 Z 字母遮罩 (逻辑层)
    const mC = document.createElement("canvas");
    mC.width = W;
    mC.height = H;
    const mctx = mC.getContext("2d");
    if (!mctx) return;

    mctx.fillStyle = "black";
    mctx.fillRect(0, 0, W, H);
    mctx.strokeStyle = "white";
    mctx.lineWidth = 65;
    mctx.lineCap = "square";
    mctx.lineJoin = "miter";
    mctx.beginPath();
    mctx.moveTo(200, 200);
    mctx.lineTo(600, 200);
    mctx.lineTo(200, 600);
    mctx.lineTo(600, 600);
    mctx.stroke();

    const maskData = mctx.getImageData(0, 0, W, H).data;
    const grid = new Uint8Array(W * H);
    const DIRS = [[0, -2], [2, 0], [0, 2], [-2, 0]];

    function isInside(x: number, y: number): boolean {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (ix < 0 || ix >= W || iy < 0 || iy >= H) return false;
      return maskData[(iy * W + ix) * 4] > 200;
    }

    // 2. 电子流系统
    const ants = Array.from({ length: 350 }, () => {
      let rx: number, ry: number;
      do {
        rx = 200 + Math.random() * 400;
        ry = 200 + Math.random() * 400;
      } while (!isInside(rx, ry));

      return {
        x: rx,
        y: ry,
        oldX: rx,
        oldY: ry,
        dir: Math.floor(Math.random() * 4),
        hue: 180 + Math.random() * 40,
      };
    });

    let animationFrameId: number;

    function step(time: number) {
      const cycle = 4000;
      const progress = (time % cycle) / cycle;
      const intensity = Math.max(0, Math.pow(Math.sin(progress * Math.PI), 1.5) * 1.2 - 0.2);

      // 透明背景下的"拖尾"实现
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + (1 - intensity) * 0.15})`;
      ctx.fillRect(0, 0, W, H);

      // 切回正常绘制模式
      ctx.globalCompositeOperation = "source-over";

      // 增加迭代次数让线条更密集
      const iterations = 3;
      ctx.lineWidth = 1.5;

      for (let n = 0; n < iterations; n++) {
        for (const a of ants) {
          const ix = Math.floor(a.x);
          const iy = Math.floor(a.y);
          const idx = iy * W + ix;

          const state = grid[idx];
          a.dir = (a.dir + (state === 0 ? 1 : 3)) % 4;
          grid[idx] = 1 - state;

          a.oldX = a.x;
          a.oldY = a.y;

          const nx = a.x + DIRS[a.dir][0];
          const ny = a.y + DIRS[a.dir][1];

          if (isInside(nx, ny)) {
            a.x = nx;
            a.y = ny;
          } else {
            a.dir = (a.dir + 2) % 4;
          }

          if (intensity > 0.01) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${a.hue}, 100%, 70%, ${intensity})`;
            ctx.moveTo(a.oldX, a.oldY);
            ctx.lineTo(a.x, a.y);
            ctx.stroke();

            // 偶尔绘制焊点
            if (Math.random() > 0.998) {
              ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
              ctx.fillRect(a.x - 1, a.y - 1, 2, 2);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(step);
    }

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block", backgroundColor: "transparent" }}
    />
  );
}

// 粒子背景（第三屏用）
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < Math.min(numParticles, 80); i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const init = () => { resize(); };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      drawLines();
      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#0d0d0d" }}
    />
  );
}

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const worksContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<number[]>([0, 1, 2, 3, 4, 5]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // GSAP 卡片轮播
  useEffect(() => {
    if (currentSection !== 1) return;

    let isActive = true;
    const cardWidth = 200;
    const cardHeight = 300;
    const gap = 40;

    const initDelay = setTimeout(() => {
      const ctx = gsap.context(() => {
        const { innerHeight: height, innerWidth: width } = window;
        const offsetTop = height - 430;
        const offsetLeft = width - 830;

        const initAnimation = () => {
          const [active, ...rest] = orderRef.current;

          gsap.set(cardsRef.current[active], { x: 0, y: 0, width, height, borderRadius: 0, zIndex: 20 });
          gsap.set(contentsRef.current[active], { x: 60, y: 240, opacity: 0 });
          gsap.to(contentsRef.current[active], { opacity: 1, duration: 0.5, delay: 0.3 });

          rest.forEach((i, index) => {
            gsap.set(cardsRef.current[i], {
              x: offsetLeft + 400 + index * (cardWidth + gap),
              y: offsetTop,
              width: cardWidth,
              height: cardHeight,
              zIndex: 30,
              borderRadius: 8,
            });
            gsap.set(contentsRef.current[i], {
              x: offsetLeft + 400 + index * (cardWidth + gap) + 20,
              y: offsetTop + cardHeight - 50,
              zIndex: 40,
              opacity: 1,
            });
          });

          gsap.from(titleRef.current, { opacity: 0, y: -20, duration: 0.6, delay: 0.2 });

          dotsRef.current.forEach((dot, i) => {
            gsap.set(dot, { backgroundColor: i === active ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.2)" });
          });

          setTimeout(() => { if (isActive) runLoop(); }, 800);
        };

        const step = () => {
          orderRef.current.push(orderRef.current.shift()!);
          const ease = "sine.inOut";

          const [active, ...rest] = orderRef.current;
          const prv = rest[rest.length - 1];

          dotsRef.current.forEach((dot, i) => {
            gsap.to(dot, { backgroundColor: i === active ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.2)", duration: 0.3 });
          });

          gsap.to(contentsRef.current[prv], { opacity: 0, y: 200, duration: 0.4, ease });

          gsap.set(cardsRef.current[prv], { zIndex: 10 });
          gsap.to(cardsRef.current[prv], { scale: 0.8, ease, duration: 0.4 });

          gsap.set(cardsRef.current[active], { zIndex: 20 });
          gsap.to(cardsRef.current[active], { x: 0, y: 0, width, height, borderRadius: 0, ease, duration: 0.5 });

          gsap.set(contentsRef.current[active], { x: 60, y: 240 });
          gsap.to(contentsRef.current[active], { opacity: 1, y: 240, duration: 0.4, delay: 0.3, ease });

          rest.forEach((i, index) => {
            if (i !== prv) {
              const xNew = offsetLeft + index * (cardWidth + gap);
              gsap.to(cardsRef.current[i], { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, ease, duration: 0.5, delay: 0.1 });
              gsap.to(contentsRef.current[i], { x: xNew + 20, y: offsetTop + cardHeight - 50, opacity: 1, ease, duration: 0.5, delay: 0.1 });
            }
          });

          setTimeout(() => {
            const xNew = offsetLeft + (rest.length - 1) * (cardWidth + gap);
            gsap.set(cardsRef.current[prv], { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, zIndex: 30, borderRadius: 8, scale: 1 });
            gsap.set(contentsRef.current[prv], { x: xNew + 20, y: offsetTop + cardHeight - 50, opacity: 1, zIndex: 40 });
          }, 600);
        };

        const runLoop = async () => {
          if (!isActive) return;
          gsap.set(indicatorRef.current, { x: -width });
          await new Promise((resolve) => gsap.to(indicatorRef.current, { x: 0, duration: 2, ease: "none", onComplete: resolve }));
          if (!isActive) return;
          await new Promise((resolve) => gsap.to(indicatorRef.current, { x: width, duration: 0.6, delay: 0.3, ease: "power2.inOut", onComplete: resolve }));
          if (!isActive) return;
          step();
          if (isActive) runLoop();
        };

        initAnimation();
      }, worksContainerRef);

      return () => { ctx.revert(); };
    }, 100);

    return () => {
      isActive = false;
      clearTimeout(initDelay);
    };
  }, [currentSection]);

  // 平滑滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let wheelTimeout: NodeJS.Timeout;

    const scrollToSection = (index: number) => {
      if (isScrolling || index < 0 || index > 2) return;
      isScrolling = true;
      gsap.to(container, {
        scrollTop: index * window.innerHeight,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          setCurrentSection(index);
          isScrolling = false;
        },
      });
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 30) scrollToSection(currentSection + 1);
        else if (e.deltaY < -30) scrollToSection(currentSection - 1);
      }, 10);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) scrollToSection(currentSection + 1);
        else scrollToSection(currentSection - 1);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      clearTimeout(wheelTimeout);
    };
  }, [currentSection]);

  const handleNavClick = useCallback((index: number) => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scrollTop: index * window.innerHeight,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  }, []);

  return (
    <div className="smooth-container" ref={containerRef}>
      {/* 第一屏 */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* 手表背景图片 - 满屏显示 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%89%8B%E8%A1%A81.png&nonce=afabf5e0-2696-490a-9a79-6719fdf7089c&project_id=7628526330237288488&sign=ac6637b0dce6aa62ecbd7e53986b5d72c772bd7b4f6b9764023547763eb0f030"
            alt="背景"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* 背景装饰 - 圆形边框 */}
        <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute -top-28 -right-28 w-[460px] h-[460px] border border-white/10 rounded-full"></div>
          <div className="absolute top-1/3 -left-36 w-[580px] h-[580px] border border-white/10 rounded-full"></div>
          <div className="absolute bottom-0 right-20 w-[320px] h-[320px] border border-white/10 rounded-full"></div>
          {/* 网格背景 */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="96" height="96" patternUnits="userSpaceOnUse">
                <path d="M96 0 L0 0 0 96" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 左侧菜单导航 */}
        <nav className={cn("absolute left-0 top-0 h-full w-44 z-20 flex flex-col px-4 py-6 border-r border-white/10 bg-black/30 backdrop-blur-sm opacity-0 animate-fade-in-up", isLoaded && "opacity-100")}>
          <div className="space-y-0 mt-16">
            {[
              { id: '01', label: '品牌', sublabel: 'BRAND' },
              { id: '02', label: '包装', sublabel: 'PACKING' },
              { id: '03', label: '标志字体', sublabel: 'LOGO&FONT' },
              { id: '04', label: '版式视觉', sublabel: 'FORMAT' },
            ].map((item) => (
              <button key={item.id} className="w-full text-left py-3 border-t border-white/10 first:border-t-0 hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white/40 text-xs mr-3.5">{item.id}</span>
                    <span className="text-base text-white/80">{item.label}</span>
                  </div>
                </div>
                <p className="text-[11px] text-white/30 mt-1 ml-8">{item.sublabel}</p>
              </button>
            ))}
          </div>
          {/* 左下角装饰 */}
          <div className="mt-auto">
            <div className="border border-white/10 w-full aspect-square flex items-center justify-center">
              <div className="w-1/2 h-1/2 border border-white/10 rounded-full"></div>
            </div>
          </div>
        </nav>

        {/* 主内容区域 */}
        <div className="relative z-10 h-full flex flex-col lg:flex-row">

          {/* 电子流 Z 字母 - 居中左侧 */}
          <div className="absolute left-44 lg:left-56 top-1/2 -translate-y-1/2">
            <div className="w-[18vw] lg:w-[14vw] aspect-[1/1.5]">
              <ZLetterCanvas />
            </div>
          </div>

          {/* 中间年份大标题 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <h1
              className={cn("text-[80px] sm:text-[100px] lg:text-[140px] font-bold tracking-tighter leading-none opacity-0 animate-fade-in-up delay-200", isLoaded && "opacity-100")}
              style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                textShadow: '0 0 30px rgba(255,255,255,0.25), 2px 2px 0 rgba(255,255,255,0.4)',
                background: 'linear-gradient(180deg, #ffffff 0%, #888888 50%, #aaaaaa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.05em'
              }}
            >
              2026
            </h1>
            <span className="absolute top-8 right-0 text-white/60 text-2xl">*</span>
          </div>

          {/* 右侧个人信息 */}
          <div className={cn("absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 text-right opacity-0 animate-fade-in-up delay-300", isLoaded && "opacity-100")}>
            <div>
              <p className="text-2xl lg:text-3xl font-light tracking-wide text-white/90" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>Qin. Tian</p>
              <p className="text-lg lg:text-xl text-white/60" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>Yang</p>
              <div className="mt-3 text-[10px] lg:text-[11px] text-white/40 space-y-1">
                <p>contact number:</p><p>15697697001</p>
                <p>e-mail:</p><p>2922717190@qq.com</p>
                <p>wechat:</p><p>2922717190@qq.com</p>
              </div>
            </div>
          </div>

          {/* 手表指针 - 右中 */}
          <div className="absolute right-[20%] lg:right-[25%] top-1/2 -translate-y-1/2 w-32 lg:w-48 z-10">
            <WatchHands />
          </div>

        </div>

        {/* 底部 PORTFOLIO */}
        <div className={cn("absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 px-6 lg:px-8 py-4 opacity-0 animate-fade-in-up delay-500", isLoaded && "opacity-100")}>
          <div className="flex items-end justify-between">
            <div className="relative">
              <h2
                className="text-[36px] sm:text-[48px] lg:text-[64px] font-bold leading-none tracking-tighter"
                style={{
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  background: 'linear-gradient(180deg, #ffffff 0%, #666666 40%, #888888 70%, #555555 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(255,255,255,0.2)',
                  letterSpacing: '-0.08em'
                }}
              >
                PORTFOLIO
              </h2>
              <span className="absolute top-4 left-[140px] sm:left-[180px] lg:left-[240px] text-white/60 text-xl">*</span>
            </div>
            <div className="text-right mb-1">
              <p className="text-xs lg:text-sm text-white/60">品牌&视觉设计师</p>
              <p className="text-[11px] text-white/40">BRAND VISION</p>
            </div>
          </div>
        </div>

        {/* 右下角装饰 */}
        <div className="absolute bottom-0 right-0 pointer-events-none z-[1]">
          <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-10">
            <path d="M0 200 Q100 100 200 0" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        {/* 滚动提示 */}
        <div className={cn("absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-0 animate-fade-in-up delay-700", isLoaded && "opacity-100")}>
          <div className="flex flex-col items-center gap-2 text-white/30 text-xs">
            <span>SCROLL</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* 第二屏 */}
      <section className="relative h-screen w-full overflow-hidden" ref={worksContainerRef}>
        <div ref={indicatorRef} className="fixed left-0 top-0 z-[60] h-[2px] w-full bg-white/80" style={{ transform: "translateX(-100%)" }} />
        <div ref={titleRef} className="absolute left-8 top-8 z-[50] text-xs tracking-[0.3em] text-white/40">WORKS</div>
        <div className="absolute bottom-8 left-8 z-[50] flex gap-2">
          {works.map((_, i) => (
            <div key={i} ref={(el) => { dotsRef.current[i] = el; }} className="h-0.5 w-8 rounded-full bg-white/20" />
          ))}
        </div>
        {works.map((work, index) => (
          <div key={`card-${index}`} ref={(el) => { cardsRef.current[index] = el; }} className="absolute left-0 top-0 bg-cover bg-center shadow-[6px_6px_10px_2px_rgba(0,0,0,0.6)]" style={{ backgroundImage: `url(${work.image})` }} />
        ))}
        {works.map((work, index) => (
          <div key={`content-${index}`} ref={(el) => { contentsRef.current[index] = el; }} className="absolute left-0 top-0 text-white z-30">
            <div className="h-[3px] w-8 bg-white/60 mb-3" />
            <p className="text-sm tracking-wider text-white/60">{work.category}</p>
            <p className="text-4xl lg:text-6xl font-bold tracking-wider mt-1">{work.title}</p>
          </div>
        ))}
      </section>

      {/* 第三屏 */}
      <section className="relative h-screen w-full overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-16">
            <a href="mailto:2922717190@qq.com" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm tracking-wide">2922717190@qq.com</span>
            </a>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-3 text-white/70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm tracking-wide">15098039595</span>
            </div>
          </div>
        </div>
      </section>

      {/* 导航 */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <button key={index} onClick={() => handleNavClick(index)} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", currentSection === index ? "bg-white/80" : "bg-white/20 hover:bg-white/40")} />
        ))}
      </div>

      {/* Coze 智能体对话组件 */}
      <CozeChat
        botId="7628802117205606446"
        apiKey="pat_ikmYxImr7JjuXoXoSogAYIVVs4ImVvzRTJHCMu0ggEGZasPpsWhEKKN1YGPHmFvS"
      />
    </div>
  );
}
