import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const SHORTCUTS = {
  UPLOAD: { key: "u", ctrl: true, label: "Ctrl+U", description: "Upload Data" },
  INSIGHTS: { key: "i", ctrl: true, label: "Ctrl+I", description: "AI Insights" },
  REPORT: {
    key: "r",
    ctrl: true,
    alt: true,
    label: "Ctrl+Alt+R",
    description: "Report Builder",
  },
  SETTINGS: {
    key: "s",
    ctrl: true,
    alt: true,
    label: "Ctrl+Alt+S",
    description: "Settings",
  },
};

// Map KeyboardEvent.code to letter for reliable detection
// This handles cases where Alt key changes the character produced
const getKeyFromCode = (code: string): string | null => {
  if (code.startsWith("Key")) {
    return code.slice(3).toLowerCase(); // "KeyA" -> "a"
  }
  return null;
};

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only enable shortcuts on dashboard pages
      if (!location.pathname.startsWith("/dashboard")) return;

      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable ||
        target.getAttribute("role") === "textbox"
      ) {
        return;
      }

      // Use e.code for reliable key detection (especially with Alt modifier)
      // e.key can produce different characters when Alt is pressed
      const keyFromCode = getKeyFromCode(e.code);
      const key = keyFromCode || e.key.toLowerCase();

      // Debug logging (remove in production)
      // console.log("Shortcut detected:", { key, code: e.code, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey });

      // Ctrl + Alt shortcuts (check these first as they're more specific)
      if (e.ctrlKey && e.altKey && !e.shiftKey) {
        switch (key) {
          case "r":
            e.preventDefault();
            e.stopPropagation();
            navigate("/dashboard/report");
            return;
          case "s":
            e.preventDefault();
            e.stopPropagation();
            navigate("/dashboard/settings");
            return;
        }
      }

      // Ctrl only shortcuts (no Alt)
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch (key) {
          case "u":
            e.preventDefault();
            e.stopPropagation();
            navigate("/dashboard/upload");
            return;
          case "i":
            e.preventDefault();
            e.stopPropagation();
            navigate("/dashboard/insights");
            return;
        }
      }
    },
    [navigate, location.pathname]
  );

  useEffect(() => {
    // Add listener with capture phase to intercept before other handlers
    // This ensures our shortcuts fire before any other keydown handlers
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleKeyDown]);
}

// Shortcut badge component
export function ShortcutBadge({ shortcut }: { shortcut: string }) {
  return (
    <span className="ml-auto text-[10px] text-muted-foreground/60 font-mono bg-secondary/50 px-1.5 py-0.5 rounded">
      {shortcut}
    </span>
  );
}
