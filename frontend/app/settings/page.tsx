"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  Bell,
  Clock,
  Settings as SettingsIcon,
  Save,
  Loader2,
} from "lucide-react";
import { conversationsAPI } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Proactivity settings
  const [proactiveEnabled, setProactiveEnabled] = useState(true);
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [proactivityLevel, setProactivityLevel] = useState(5);
  const [minLevel, setMinLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(10);
  const [quietHoursStart, setQuietHoursStart] = useState("");
  const [quietHoursEnd, setQuietHoursEnd] = useState("");

  // Stats
  const [totalProactive, setTotalProactive] = useState(0);
  const [responsesReceived, setResponsesReceived] = useState(0);
  const [responseRate, setResponseRate] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      // Get conversation
      const convResponse = await conversationsAPI.getOrCreate();
      const convId = convResponse.conversation.id;
      setConversationId(convId);

      // Load proactivity settings
      const settings = await conversationsAPI.getProactivitySettings(convId);

      setProactiveEnabled(settings.proactive_messages_enabled);
      setAutoAdjust(settings.auto_adjust_proactivity);
      setProactivityLevel(settings.proactivity_level);
      setMinLevel(settings.min_proactivity_level);
      setMaxLevel(settings.max_proactivity_level);
      setQuietHoursStart(settings.quiet_hours_start || "");
      setQuietHoursEnd(settings.quiet_hours_end || "");

      setTotalProactive(settings.total_proactive_messages);
      setResponsesReceived(settings.proactive_responses_received);
      setResponseRate(settings.response_rate);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!conversationId) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      await conversationsAPI.updateProactivitySettings(conversationId, {
        proactive_messages_enabled: proactiveEnabled,
        auto_adjust_proactivity: autoAdjust,
        proactivity_level: proactivityLevel,
        min_proactivity_level: minLevel,
        max_proactivity_level: maxLevel,
        quiet_hours_start: quietHoursStart || null,
        quiet_hours_end: quietHoursEnd || null,
      });

      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Chat
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-indigo-600">Settings</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Customize Meggy's behavior
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-8">
        {/* Proactive Messages Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Proactive Messages
            </h2>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Enable Proactive Messages
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Allow Meggy to initiate conversations with you
                </p>
              </div>
              <button
                onClick={() => setProactiveEnabled(!proactiveEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  proactiveEnabled
                    ? "bg-indigo-600"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    proactiveEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {proactiveEnabled && (
              <>
                {/* Proactivity Level */}
                <div>
                  <label className="block font-semibold text-zinc-900 dark:text-white mb-2">
                    Proactivity Level: {proactivityLevel}
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {proactivityLevel <= 3
                      ? "Meggy will rarely reach out (8+ hours between messages)"
                      : proactivityLevel <= 6
                        ? "Meggy will occasionally check in (2-4 hours)"
                        : "Meggy will actively engage (30 min - 2 hours)"}
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={proactivityLevel}
                    onChange={(e) =>
                      setProactivityLevel(Number(e.target.value))
                    }
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                    disabled={autoAdjust}
                  />
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    <span>Passive (1)</span>
                    <span>Very Active (10)</span>
                  </div>
                </div>

                {/* Auto-Adjust */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      Auto-Adjust Proactivity
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Let Meggy learn your preferences and adjust automatically
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoAdjust(!autoAdjust)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoAdjust
                        ? "bg-indigo-600"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoAdjust ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Min/Max Bounds */}
                {autoAdjust && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                        Minimum Level: {minLevel}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={minLevel}
                        onChange={(e) => setMinLevel(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                        Maximum Level: {maxLevel}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={maxLevel}
                        onChange={(e) => setMaxLevel(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Quiet Hours */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      Quiet Hours
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    Times when Meggy won't send proactive messages
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={quietHoursStart}
                        onChange={(e) => setQuietHoursStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={quietHoursEnd}
                        onChange={(e) => setQuietHoursEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">
                    Engagement Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {totalProactive}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        Proactive Messages
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {responsesReceived}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        Responses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {Math.round(responseRate * 100)}%
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        Response Rate
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saveMessage && (
              <p
                className={`text-sm ${
                  saveMessage.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {saveMessage}
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
