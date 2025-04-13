"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";

const MESSAGE_LIMIT = 15;
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const ChatBot = () => {
  const [messages, setMessages] = useState<
    { message: string; sender: "user" | "bot"; loading: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check block status on initial load
  useEffect(() => {
    const blockUntil = localStorage.getItem("blockUntil");
    if (blockUntil && Date.now() < Number(blockUntil)) {
      setIsBlocked(true);
    } else {
      localStorage.removeItem("blockUntil");
      setIsBlocked(false);
    }
  }, []);

  const getBotResponse = async (userMessage: string) => {
    setIsLoading(true);

    const conversationHistory = messages.map((msg) => ({
      role: msg.sender,
      text: msg.message,
    }));

    conversationHistory.push({
      role: "user",
      text: userMessage,
    });

    const response = await fetch(
      "https://commentsense-wqo0.onrender.com/rag/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          conversationHistory: conversationHistory,
        }),
      }
    );

    const data = await response.json();
    setIsLoading(false);

    return data?.data?.answer || "Sorry, I couldn't understand that.";
  };

  const handleSend = async () => {
    if (isBlocked || !input.trim()) return;
    setInput("");
    const userMessagesCount = messages.filter(
      (m) => m.sender === "user"
    ).length;

    if (userMessagesCount >= MESSAGE_LIMIT) {
      const blockUntil = Date.now() + BLOCK_DURATION;
      localStorage.setItem("blockUntil", blockUntil.toString());
      setIsBlocked(true);
      return;
    }

    const userMsg = {
      message: input.trim(),
      sender: "user" as const,
      loading: false,
    };

    const botMsg = { message: "", sender: "bot" as const, loading: true };

    setMessages((prevMessages) => [...prevMessages, userMsg, botMsg]);

    try {
      const botMessage = await getBotResponse(input.trim());

      setMessages((prevMessages) => {
        const lastBotMessageIndex = prevMessages.findIndex(
          (msg) => msg.sender === "bot" && msg.loading === true
        );

        if (lastBotMessageIndex !== -1) {
          prevMessages[lastBotMessageIndex] = {
            message: botMessage,
            sender: "bot",
            loading: false,
          };
        }

        return [...prevMessages];
      });
    } catch (error) {
      console.error("Error fetching bot response:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4 w-full">
      <div className="w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
        {messages?.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar px-2">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.message}
                sender={msg.sender}
                isLoading={msg.loading}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center gap-6 text-center">
            <img src="assets/hi.png" alt="Bot says hi" className="h-40" />
            <h2 className="text-2xl font-semibold">Say hi to CommentSense!</h2>
            <p className="text-sm text-red-400 max-w-md">
              ⚠️ Warning: This bot is extremely offensive and unapologetically
              disrespectful. Engage at your own risk. You’ve been warned.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-zinc-700 bg-zinc-900 p-4">
          <input
            type="text"
            placeholder={
              isBlocked
                ? "Limit exceeded for 24 hrs. Come back later 😈"
                : "Ask something savage..."
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isBlocked}
            className="flex-1 px-4 py-2 rounded-lg border-none focus:outline-none focus:ring-0 bg-zinc-800 text-white placeholder:text-zinc-500 disabled:opacity-50"
          />
          <div
            onClick={handleSend}
            className={`cursor-pointer ${
              isBlocked ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <img src="assets/send.png" alt="send message" className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
