import { useRef, useEffect } from "react";

export function useEmojiInsertion(
  content: string,
  setContent: (content: string) => void
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEmojiSelect = (
    emoji: string,
    textarea: HTMLTextAreaElement | null
  ) => {
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);

      // Move cursor after emoji
      timeoutRef.current = setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + emoji);
    }
  };

  return { handleEmojiSelect };
}
