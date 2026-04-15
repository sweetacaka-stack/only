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
      // 第一步：创建对话会话
      const createResponse = await fetch("https://api.coze.cn/v3/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          bot_id: botId,
          user_id: "web_user",
          stream: true,
          auto_save_history: true,
          additional_messages: [
            {
              role: "user",
              content: userMessage,
              content_type: "text"
            }
          ]
        })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`API 请求失败: ${errorText}`);
      }

      const reader = createResponse.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantMsgId = (Date.now() + 1).toString();
      let messageComplete = false;

      // 添加空的 assistant 消息
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: "assistant",
        content: ""
      }]);

      while (reader && !messageComplete) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;
          
          // Coze 流式响应格式：event: xxx\ndata: {...}
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5));
              
              // 处理 delta 格式 - 内容在 delta.content 中
              if (data.delta?.content) {
                assistantMessage += data.delta.content;
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              }
              
              // 检测消息结束
              if (line.includes('"type":"finish"') || data.type === "finish") {
                messageComplete = true;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      // 如果没有收到任何内容，添加默认回复
      if (!assistantMessage.trim()) {
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMsgId
            ? { ...msg, content: "我已收到你的消息，正在思考..." }
            : msg
        ));
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "抱歉，发生了错误，请稍后再试。"
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
  { id: 1, title: "MONOGRAPH", category: "Brand Identity", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
  { id: 2, title: "AURA", category: "Visual Design", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop" },
  { id: 3, title: "VOID", category: "Art Direction", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" },
  { id: 4, title: "ETHEREAL", category: "Photography", image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2670&auto=format&fit=crop" },
  { id: 5, title: "METRIC", category: "Data Visualization", image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop" },
  { id: 6, title: "LUMEN", category: "Installation", image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2574&auto=format&fit=crop" },
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

// 蚂蚁群粒子效果 - 形成 Z 字母
function TurmiteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const grid: Record<number, Record<number, number>> = {};
    let vants: Vant[] = [];
    let width = 0;
    let height = 0;

    class Vant {
      x: number;
      y: number;
      orientation: string;
      state: number;
      color: number;
      rules: number[][][];

      constructor(x: number, y: number, orientation: string, rules: number[][][]) {
        this.x = x;
        this.y = y;
        this.orientation = orientation;
        this.state = 0;
        this.color = 0;
        this.rules = rules;
      }
    }

    function randBetween(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomRule(): number[] {
      return [randBetween(0, 1), [1, 2, 4, 8][randBetween(0, 3)], randBetween(0, 1)];
    }

    function randomRuleset(): number[][][] {
      return [[randomRule(), randomRule()], [randomRule(), randomRule()]];
    }

    function findOrientation(dir: number, ori: string): string {
      if (dir === 1) return ori;
      else if (dir === 4) {
        if (ori === "n") return "s";
        else if (ori === "s") return "n";
        else if (ori === "e") return "w";
        else return "e";
      } else {
        if (ori === "n") return dir === 2 ? "e" : "w";
        else if (ori === "e") return dir === 2 ? "s" : "n";
        else if (ori === "s") return dir === 2 ? "w" : "e";
        else return dir === 2 ? "n" : "s";
      }
    }

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      vants = [];
      
      // Z 字形参数
      const centerX = width / 2;
      const centerY = height / 2;
      const zSize = Math.min(width, height) * 0.35; // Z 大小
      const zLeft = centerX - zSize / 2;
      const zTop = centerY - zSize / 2;
      const zBottom = centerY + zSize / 2;

      // 规则：直行、涂黑、无状态变化
      const drawRule: number[][][] = [[[1, 1, 0], [1, 1, 0]], [[1, 1, 0], [1, 1, 0]]];

      // 1. Z 顶部横线 → 向右
      vants.push(new Vant(zLeft, zTop, "e", drawRule));
      // 2. Z 斜线 → 右下
      vants.push(new Vant(zLeft, zTop, "s", drawRule));
      // 3. Z 底部横线 → 向右
      vants.push(new Vant(zLeft, zBottom, "e", drawRule));

      // 补充多只蚂蚁加速绘制 Z
      vants.push(new Vant(zLeft + 50, zTop, "e", drawRule));
      vants.push(new Vant(zLeft + 50, zBottom, "e", drawRule));
      vants.push(new Vant(zLeft + 50, zTop, "s", drawRule));

      // 随机蚂蚁只在Z字母区域内活动
      for (let i = 0; i <= 3000; i++) {
        const randX = zLeft + Math.random() * zSize;
        const randY = zTop + Math.random() * zSize;
        vants.push(
          new Vant(randX, randY, ["n", "e", "s", "w"][randBetween(0, 3)], randomRuleset())
        );
      }

      // 初始画布为透明
      ctx.clearRect(0, 0, width, height);
    };

    const animate = () => {
      vants.forEach((vant) => {
        vant.color = grid[vant.x]?.[vant.y] ?? 0;

        const rule = vant.rules[vant.state][vant.color];
        vant.orientation = findOrientation(rule[1], vant.orientation);
        
        // 绘制点
        ctx.fillStyle = rule[0] === 1 ? "#DDDDDD" : "black";
        ctx.fillRect(vant.x, vant.y, 1, 1);
        
        vant.color = rule[0];
        vant.state = rule[2];

        // 保存到网格
        if (!grid[vant.x]) grid[vant.x] = {};
        grid[vant.x][vant.y] = vant.color;

        // 蚂蚁移动
        if (vant.orientation === "n") vant.y -= 1;
        else if (vant.orientation === "s") vant.y += 1;
        else if (vant.orientation === "e") vant.x += 1;
        else vant.x -= 1;

        // 边界循环
        if (vant.x > width) vant.x = 0;
        if (vant.x < 0) vant.x = width;
        if (vant.y > height) vant.y = 0;
        if (vant.y < 0) vant.y = height;

        // 绘制白色点
        ctx.fillStyle = "white";
        ctx.fillRect(vant.x, vant.y, 1, 1);
      });

      animationId = requestAnimationFrame(animate);
    };

    init();
    animationId = requestAnimationFrame(animate);

    window.addEventListener("resize", () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
      init();
    });

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

// 粒子背景
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
        {/* 背景图片 */}
        <div className="absolute inset-0 z-0">
          <img src="/assets/手表1.png" alt="背景" className="w-full h-full object-cover brightness-110" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* 蚂蚁群效果 */}
        <TurmiteCanvas />

        {/* 巨型 Z 字母 */}
        <div className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 z-10">
          <h1 className={cn("text-[20vw] lg:text-[18vw] font-bold leading-none text-white/90 opacity-0 animate-fade-in-up", isLoaded && "opacity-100")}>
            Z
          </h1>
        </div>

        {/* 手表指针 */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-48 h-48 z-10">
          <WatchHands />
        </div>

        {/* 右上角 */}
        <div className="absolute top-8 right-8 z-20">
          <span className={cn("text-xs tracking-[0.3em] text-white/50 opacity-0 animate-fade-in-up", isLoaded && "opacity-100")}>
            PORTFOLIO 2026
          </span>
        </div>

        {/* 右侧身份 */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 text-right">
          <div className={cn("flex gap-4 justify-end mb-4 opacity-0 animate-fade-in-up delay-200", isLoaded && "opacity-100")}>
            <span className="text-lg lg:text-xl text-white/80" style={{ writingMode: "vertical-rl" }}>视觉</span>
            <span className="text-lg lg:text-xl text-white/80" style={{ writingMode: "vertical-rl" }}>设计师</span>
          </div>
          <p className={cn("text-sm tracking-[0.3em] text-white/60 opacity-0 animate-fade-in-up delay-300", isLoaded && "opacity-100")}>
            VISUAL DESIGNER
          </p>
        </div>

        {/* 右下角理念 */}
        <div className="absolute bottom-12 right-8 lg:right-16 z-20 text-right max-w-sm">
          <p className={cn("text-xs lg:text-sm text-white/40 leading-relaxed opacity-0 animate-fade-in-up delay-500", isLoaded && "opacity-100")}>
            用黑白灰秩序讲述视觉故事
          </p>
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
