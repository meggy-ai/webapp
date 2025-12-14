"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Send,
  Loader2,
  Settings,
  LogOut,
  Sparkles,
  Clock,
  BellRing,
  StickyNote,
} from "lucide-react";
import { conversationsAPI, messagesAPI, timersAPI } from "@/lib/api";
import TimerDisplay from "@/components/chat/TimerDisplay";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: string;
}

// Note: Timer command parsing and detection is now done by the backend using LLM
// No client-side regex parsing is needed anymore

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isResponseToProactive, setIsResponseToProactive] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showTimers, setShowTimers] = useState(false);
  const [wsTimerEvent, setWsTimerEvent] = useState<{
    type: string;
    data: any;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    initializeChat();

    return () => {
      // Cleanup WebSocket on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection for real-time proactive messages
  useEffect(() => {
    if (!conversationId) return;

    const connectWebSocket = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//localhost:8000/ws/chat/?token=${token}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "connection_established") {
            console.log("WebSocket connection established", data);
          } else if (data.type === "proactive_message") {
            // Add proactive message to chat
            setMessages((prev) => [
              ...prev,
              {
                id: data.message.id,
                content: data.message.content,
                role: "assistant",
                timestamp: data.message.created_at,
              },
            ]);

            // Mark next user message as response to proactive
            setIsResponseToProactive(true);
          } else if (data.type === "proactivity_update") {
            console.log("Proactivity level updated:", data.proactivity_level);
          } else if (data.type === "timer_warning") {
            // Play warning sound
            playNotificationSound("warning");

            // Add system message
            setMessages((prev) => [
              ...prev,
              {
                id: `timer-warning-${data.timer_id}`,
                content: data.message,
                role: "system",
                timestamp: new Date().toISOString(),
              },
            ]);
          } else if (data.type === "timer_completed") {
            // Play completion sound
            playNotificationSound("completion");

            // Add system message
            setMessages((prev) => [
              ...prev,
              {
                id: `timer-complete-${data.timer_id}`,
                content: data.message,
                role: "system",
                timestamp: new Date().toISOString(),
              },
            ]);

            // Trigger timer update
            setWsTimerEvent({ type: "timer_completed", data });
          } else if (data.type === "timer_update") {
            // Timer state changed (created, paused, resumed, cancelled, or tick)
            setWsTimerEvent({ type: "timer_update", data });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket closed, reconnecting in 5s...");
        setWsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [conversationId]);

  const playNotificationSound = (type: "warning" | "completion") => {
    try {
      const soundFile =
        type === "warning"
          ? "/sounds/timer-warning.wav"
          : "/sounds/timer-complete.wav";

      const audio = new Audio(soundFile);
      audio.volume = 0.6; // Adjust volume (0.0 to 1.0)
      audio.play().catch((error) => {
        console.error("Error playing notification sound:", error);
      });
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    // Check authentication
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(userData));

    try {
      // Get or create the user's single conversation with Meggy
      const response = await conversationsAPI.getOrCreate();
      const conversation = response.conversation;
      setConversationId(conversation.id);

      // Load all messages in the timeline
      await loadMessages(conversation.id);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      // Load only last 6 messages initially
      console.log("Loading messages for conversation:", convId);
      const data = await messagesAPI.getByConversation(convId, { limit: 6 });
      console.log("Received messages:", data);
      const messagesArray = Array.isArray(data) ? data : [];
      console.log("Messages array length:", messagesArray.length);
      setMessages(messagesArray);
      setHasMoreMessages(messagesArray.length === 6);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const loadMoreMessages = async () => {
    if (
      !conversationId ||
      isLoadingMore ||
      !hasMoreMessages ||
      messages.length === 0
    )
      return;

    setIsLoadingMore(true);
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    try {
      // Get the oldest message ID (first in array since they're in chronological order)
      const oldestMessageId = messages[0].id;

      // Load messages before the oldest one
      const data = await messagesAPI.getByConversation(conversationId, {
        limit: 10,
        before: oldestMessageId,
      });
      const messagesArray = Array.isArray(data) ? data : [];

      if (messagesArray.length > 0) {
        setMessages((prev) => [...messagesArray, ...prev]);

        // Maintain scroll position after adding messages
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        }, 0);
      }

      // If we got less than requested, no more messages available
      setHasMoreMessages(messagesArray.length === 10);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle scroll event to load more messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;

    // Check if scrolled to top (with small threshold)
    if (container.scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !conversationId) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistically add user message FIRST
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      role: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Timer commands are now handled by the backend via LLM
    // No need for client-side parsing

    try {
      // Command detection and timer handling now done by backend using LLM
      console.log("📤 Sending message to backend for LLM command detection");

      const response = await conversationsAPI.sendMessage(
        conversationId,
        userMessage,
        isResponseToProactive
      );

      // Reset proactive flag
      if (isResponseToProactive) {
        setIsResponseToProactive(false);
      }

      // Replace temp message with actual messages from backend
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        {
          id: response.user_message.id,
          content: response.user_message.content,
          role: "user",
          timestamp: response.user_message.created_at,
        },
        {
          id: response.assistant_message.id,
          content: response.assistant_message.content,
          role: "assistant",
          timestamp: response.assistant_message.created_at,
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connecting to Meggy...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Left: Meggy branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-indigo-600">Meggy AI</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your AI Companion
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mr-4">
              <button
                title="Timers"
                onClick={() => setShowTimers(!showTimers)}
                className={`p-2 rounded-lg transition-colors ${
                  showTimers
                    ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <Clock className="h-5 w-5" />
              </button>
              <button
                title="Reminders"
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <BellRing className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </button>
              <button
                title="Notes"
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <StickyNote className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area with optional timer panel */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Messages Timeline */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-zinc-950"
          >
            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="text-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Loading more messages...
                </p>
              </div>
            )}

            {/* Load more prompt or end indicator */}
            {messages.length > 0 && (
              <div className="text-center py-2">
                {!isLoadingMore && hasMoreMessages ? (
                  <button
                    onClick={loadMoreMessages}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    ↑ Scroll up to load older messages
                  </button>
                ) : !isLoadingMore && !hasMoreMessages ? (
                  <div className="flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                    <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800"></div>
                    <span className="text-xs">Beginning of conversation</span>
                    <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800"></div>
                  </div>
                ) : null}
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl mb-6">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">
                    Hey there! I'm Meggy 👋
                  </h2>
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                    Your always-on AI companion. I'm here to chat, help, and
                    learn about you over time.
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    I can set timers, create reminders, take notes, and much
                    more. Let's start our conversation!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-zinc-200 dark:bg-zinc-700"
                          : "bg-gradient-to-br from-indigo-500 to-indigo-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      ) : (
                        <Bot className="h-5 w-5 text-white" />
                      )}
                    </div>

                    <div
                      className={`flex-1 max-w-2xl ${
                        message.role === "user" ? "text-right" : ""
                      }`}
                    >
                      <div
                        className={`inline-block rounded-2xl px-5 py-3 ${
                          message.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2 px-2">
                        {message.timestamp &&
                        !isNaN(new Date(message.timestamp).getTime())
                          ? new Date(message.timestamp).toLocaleTimeString(
                              undefined,
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Bruno Thinking Animation */}
                {isSending && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 animate-pulse">
                      <Bot className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 max-w-2xl">
                      <div className="inline-block rounded-2xl px-5 py-4 bg-zinc-100 dark:bg-zinc-800">
                        <div className="flex items-center gap-3">
                          {/* Animated thinking dots */}
                          <div className="flex gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                          {/* Sparkle icon with rotation animation */}
                          <Sparkles
                            className="h-4 w-4 text-indigo-500 animate-spin"
                            style={{ animationDuration: "3s" }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                          Meggy is thinking...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Chat with Meggy..."
                disabled={isSending}
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-3">
              Meggy is always learning and improving. Your privacy is protected.
            </p>
          </div>
        </div>

        {/* Timer Panel - Right Side */}
        {showTimers && (
          <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-y-auto">
            <div className="p-4">
              <TimerDisplay
                wsEvent={wsTimerEvent}
                onTimerUpdate={() => {
                  /* Timer updated */
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
