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
import { conversationsAPI, messagesAPI } from "@/lib/api";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const data = await messagesAPI.getByConversation(convId);
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !conversationId) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      role: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await conversationsAPI.sendMessage(
        conversationId,
        userMessage
      );

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
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
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

      {/* Main Chat Area - Full width, no sidebar */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-zinc-950">
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
                  Your always-on AI companion. I'm here to chat, help, and learn
                  about you over time.
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  I can set timers, create reminders, take notes, and much more.
                  Let's start our conversation!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
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
                    {new Date(message.timestamp).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))
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
      </main>
    </div>
  );
}
