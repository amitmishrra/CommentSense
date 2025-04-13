'use client';

import ChatBot from "@/containers/Chatbot";

export default function Home() {
  return (
    <main className="min-h-screen bg-[oklch(0.42 0.01 0.07)] flex items-center justify-center">
      <ChatBot />
    </main>
  );
}