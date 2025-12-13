"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Send,
  Loader2,
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import { conversationsAPI, messagesAPI, agentsAPI } from "@/lib/api";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  message_count?: number;
  last_message?: {
    role: string;
    content: string;
    created_at: string;
  };
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(userData));
    loadConversations();
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const data = await conversationsAPI.getAll();
      // Ensure data is an array
      const conversationsArray = Array.isArray(data) ? data : [];
      setConversations(conversationsArray);
      if (conversationsArray.length > 0 && !activeConversation) {
        setActiveConversation(conversationsArray[0].id);
        loadMessages(conversationsArray[0].id);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setConversations([]); // Set empty array on error
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const data = await messagesAPI.getByConversation(conversationId);
      // Ensure data is an array
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      // First, get the default agent
      const defaultAgent = await agentsAPI.getDefault();

      const newConv = await conversationsAPI.create({
        title: "New Conversation",
        agent: defaultAgent.id,
      });
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv.id);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !activeConversation) return;

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
      // Send message to backend and get both user and assistant messages
      const response = await conversationsAPI.sendMessage(
        activeConversation,
        userMessage
      );

      // Replace temp message with actual messages from backend
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        {
          id: response.user_message.id,
          content: response.user_message.content,
          role: "user" as const,
          timestamp: response.user_message.created_at,
        },
        {
          id: response.assistant_message.id,
          content: response.assistant_message.content,
          role: "assistant" as const,
          timestamp: response.assistant_message.created_at,
        },
      ]);

      // Reload conversations to update the sidebar with new message info
      loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove temp message on error
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

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-indigo-600">Meggy AI</span>
          </Link>

          <div className="flex items-center gap-4">
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversations List */}
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={createNewConversation}
              className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-400" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No conversations yet
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  Start a new chat to begin
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    loadMessages(conv.id);
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-all ${
                    activeConversation === conv.id
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold block truncate">
                        {conv.title}
                      </span>
                      {conv.last_message && (
                        <p className="text-xs mt-1 opacity-75 line-clamp-2">
                          {conv.last_message.role === "user" ? "You: " : "Bruno: "}
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span>
                      {conv.message_count || 0} message{conv.message_count !== 1 ? "s" : ""}
                    </span>
                    <span>
                      {new Date(conv.updated_at || conv.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg mb-4">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Ask me anything! I'm here to help you with your
                        questions and tasks.
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
                        className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                          message.role === "assistant"
                            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <Bot className="h-6 w-6" />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-3xl ${
                          message.role === "user" ? "text-right" : ""
                        }`}
                      >
                        <div
                          className={`inline-block p-4 rounded-2xl ${
                            message.role === "user"
                              ? "bg-indigo-600 text-white"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 px-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950">
                <form
                  onSubmit={handleSendMessage}
                  className="max-w-4xl mx-auto"
                >
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isSending}
                      className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isSending}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-zinc-400" />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  No conversation selected
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Select a conversation from the sidebar or create a new one to
                  start chatting
                </p>
                <button
                  onClick={createNewConversation}
                  className="inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
