import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MessageCircle,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadAnalysisData, loadAnalysisResults } from "@/lib/analyticsEngine";
import { setUserItem, STORAGE_KEYS } from "@/lib/userStorage";
import { API_ENDPOINTS } from "@/config/api";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface AIChatBoxProps {
  hasData: boolean;
}

export function AIChatBox({ hasData }: AIChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-index FULL data for AI when chat opens (limit to 500 rows to avoid payload issues)
  // This ensures AI has access to ALL columns, not just chart selections
  const reindexData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const analysisData = loadAnalysisData();
    const analyticsResults = loadAnalysisResults();

    if (!analysisData || !analysisData.data) {
      console.log("⚠️ No data to index for AI");
      return;
    }

    setIsIndexing(true);
    const totalRows = analysisData.data.length;
    const maxRows = 500; // Limit rows to prevent payload too large
    const dataToSend = analysisData.data.slice(0, maxRows);
    
    console.log(`🔄 Re-indexing FULL dataset for AI... (${dataToSend.length}/${totalRows} rows, ${analysisData.fields?.length} columns)`);

    try {
      const response = await fetch(API_ENDPOINTS.AI.INDEX, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Send COMPLETE analysis data with ALL fields
          analysisData: {
            fileName: analysisData.fileName,
            fileType: analysisData.fileType,
            data: dataToSend,
            fields: analysisData.fields, // ALL columns, not filtered
            rowCount: totalRows,
            timestamp: analysisData.timestamp,
          },
          // Include FULL analytics results for comprehensive context
          analyticsResults: analyticsResults ? {
            insights: analyticsResults.insights || [],
            correlations: analyticsResults.correlations || [],
            outliers: analyticsResults.outliers || [],
            numericColumns: analyticsResults.numericColumns || [],
            categoricalColumns: analyticsResults.categoricalColumns || [],
            columns: analyticsResults.columns || [],
            recommendedXAxis: analyticsResults.recommendedXAxis,
            recommendedYAxis: analyticsResults.recommendedYAxis,
            dateColumn: analyticsResults.dateColumn,
          } : null,
          insights: analyticsResults?.insights || [],
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ AI re-index complete:", result);
        console.log(`   Indexed ${result.fieldsIndexed} columns, ${result.rowsIndexed} rows, ${result.chunksIndexed} chunks`);
      } else {
        console.error("❌ AI re-index failed:", result.message);
      }
    } catch (error) {
      console.error("❌ Failed to re-index for AI:", error);
    } finally {
      setIsIndexing(false);
    }
  }, []);

  // Re-index when chat opens
  useEffect(() => {
    if (isOpen && hasData) {
      reindexData();
    }
  }, [isOpen, hasData, reindexData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Save chat history to localStorage for Report Builder
  useEffect(() => {
    if (messages.length > 1) { // Skip if only welcome message
      const chatHistory = messages
        .filter(m => m.role !== "system" && m.id !== "welcome")
        .map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        }));
      setUserItem(STORAGE_KEYS.AI_CHAT_HISTORY, chatHistory);
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add welcome message when chat opens with data
  useEffect(() => {
    if (isOpen && hasData && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Hi! I'm your FlowDapt AI Assistant. I have access to your ENTIRE dataset - all columns and all data, not just what's shown in charts.\n\nTry asking about ANY field combination:\n\n• \"What's the total revenue by region?\"\n• \"Show me sales trends over time\"\n• \"Compare product performance\"\n• \"Which category has the highest profit?\"\n• \"What are the key insights?\"",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, hasData, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      console.log("🤖 [AI Chat] Sending query:", userMessage.content);
      console.log("🤖 [AI Chat] Token present:", !!token);
      
      const response = await fetch(API_ENDPOINTS.AI.CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: userMessage.content,
          sessionId,
        }),
      });

      const data = await response.json();
      console.log("🤖 [AI Chat] Response:", data);

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: data.response || "I couldn't process that. Please try again.",
        timestamp: new Date(),
        isError: !data.success,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(API_ENDPOINTS.AI.CLEAR_SESSION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (e) {
      // Ignore errors
    }
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What are the key insights from all columns?",
    "Show me totals by category",
    "Which field has the highest values?",
    "Compare performance across groups",
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="gradient"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 pr-12 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <SheetTitle className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              FlowDapt AI
            </SheetTitle>
            <div className="flex items-center gap-1">
              {hasData && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={reindexData}
                  disabled={isIndexing}
                  title="Re-sync data with AI"
                >
                  <RefreshCw className={cn("h-4 w-4", isIndexing && "animate-spin")} />
                </Button>
              )}
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Ask questions about your data
          </p>
        </SheetHeader>

        {!hasData ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No Data Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a dataset first to start asking questions about your
                data.
              </p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto text-primary/50 mb-4" />
              <h3 className="font-medium mb-2">Ask me anything!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                I can analyze your uploaded data and answer questions about trends, totals, comparisons, and more.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.slice(0, 2).map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInput(q);
                    }}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : message.isError
                          ? "bg-destructive/10 text-destructive rounded-bl-md"
                          : "bg-secondary rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Analyzing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {messages.length === 1 && !isLoading && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Quick questions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((q) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {
                            setInput(q);
                            setTimeout(() => sendMessage(), 100);
                          }}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your data..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                AI responses are based only on your uploaded data
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
