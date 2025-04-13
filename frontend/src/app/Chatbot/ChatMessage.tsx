import { cn } from "@/utils/utils";
import React from "react";

type Props = {
  message: string;
  sender: "user" | "bot";
  isLoading?: boolean;
};

const ChatMessage: React.FC<Props> = ({ message, sender, isLoading }) => {
  const isUser = sender === "user";

  return (
    <div
      className={cn(
        "w-full flex py-2 cursor-default",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2 max-w-xs md:max-w-md text-sm md:text-base min-h-[40px] items-center justify-center flex ",
          isUser
            ? "bg-[#f4ab9a] text-zinc-800"
            : "bg-[#74ba9c] text-white"
        )}
      >
        {isLoading ? (
          <div className="flex space-x-1">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
          </div>
        ) : (
          message
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
