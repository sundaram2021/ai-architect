"use client";

interface NewChatButtonProps {
  onNewChat: () => void;
  hasMessages: boolean;
}

export function NewChatButton({ onNewChat, hasMessages }: NewChatButtonProps) {
  const handleClick = () => {
    if (hasMessages) {
      const confirmed = window.confirm(
        "Current chat will be lost. Are you sure you want to start a new chat?"
      );
      if (!confirmed) return;
    }
    onNewChat();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg text-purple-400 hover:text-purple-300 
                 hover:bg-purple-500/10 transition-colors"
      title="New chat"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
