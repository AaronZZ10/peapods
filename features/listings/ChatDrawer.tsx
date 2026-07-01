"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMessages, sendMessage, getListingConversations } from "@/lib/actions/messages";
import { MessageSquare, Send, ArrowLeft, User, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatDrawerProps {
  listingId: string;
  hostName: string;
  isHost: boolean;
  currentUserId: string;
}

export function ChatDrawer({ listingId, hostName, isHost, currentUserId }: ChatDrawerProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Load host conversations if user is host
  useEffect(() => {
    if (open && isHost && !selectedStudentId) {
      setLoading(true);
      getListingConversations(listingId).then((res) => {
        setConversations(res);
        setLoading(false);
      });
    }
  }, [open, isHost, selectedStudentId, listingId]);

  // Poll for new messages every 3 seconds while chat is open
  useEffect(() => {
    if (!open) return;
    if (isHost && !selectedStudentId) return;

    const fetchMsgs = async () => {
      const res = await getMessages(listingId, selectedStudentId || undefined);
      setMessages(res);
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);

    return () => clearInterval(interval);
  }, [open, listingId, selectedStudentId, isHost]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(listingId, newMessage, selectedStudentId || undefined);
      setNewMessage("");
      // Immediately reload
      const res = await getMessages(listingId, selectedStudentId || undefined);
      setMessages(res);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-md font-bold gap-2 flex items-center justify-center"
          >
            <MessageSquare className="h-5 w-5" />
            {isHost ? "View Inbox Chats" : "Message Host"}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px] h-[550px] p-0 flex flex-col overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="bg-emerald-50 px-6 py-4 border-b flex flex-row items-center gap-3">
          {isHost && selectedStudentId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-slate-500 hover:bg-emerald-100/50"
              onClick={() => {
                setSelectedStudentId(null);
                setMessages([]);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <DialogTitle className="text-lg font-black text-slate-900 leading-tight">
              {isHost
                ? selectedStudentId
                  ? `Chat with ${selectedStudentName}`
                  : "Listing Inquiry Chats"
                : `Chat with Host (${hostName})`}
            </DialogTitle>
            <p className="text-xs text-slate-500 font-medium">
              {isHost && !selectedStudentId ? "Select a subletter to reply" : "Sublease Inquiry"}
            </p>
          </div>
        </DialogHeader>

        {/* Host Conversations Thread List */}
        {isHost && !selectedStudentId ? (
          <ScrollArea className="flex-1 p-4 bg-slate-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[350px] text-slate-400 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <p className="text-sm font-semibold">Loading inquiries...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[350px] text-center text-slate-400 p-8 space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No messages yet</h4>
                <p className="text-xs max-w-[240px]">
                  When student subletters inquire about this room, their chats will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {conversations.map((convo) => (
                  <button
                    key={convo.userId}
                    onClick={() => {
                      setSelectedStudentId(convo.userId);
                      setSelectedStudentName(convo.full_name);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200/60 hover:border-emerald-500 hover:shadow-sm transition-all flex items-center gap-3 active:scale-[0.98]"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xs font-black text-teal-800 uppercase">
                      {convo.full_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{convo.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{convo.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        ) : (
          /* Message List and Form */
          <>
            <ScrollArea className="flex-1 p-6 bg-slate-50">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center text-slate-400 p-8 space-y-2">
                    <User className="h-8 w-8 text-emerald-500/60" />
                    <h5 className="font-bold text-slate-800 text-sm">Start the conversation</h5>
                    <p className="text-xs max-w-[200px]">
                      Send a message to introduce yourself and ask about dates or roommates.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                            isOwn
                              ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                              : "bg-white text-slate-800 border rounded-tl-none font-medium"
                          )}
                        >
                          <p className="leading-normal break-words">{msg.content}</p>
                          <span
                            className={cn(
                              "text-[9px] block text-right mt-1 opacity-70",
                              isOwn ? "text-emerald-100" : "text-slate-400"
                            )}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2 items-center">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 rounded-xl h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-50 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || sending}
                className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 shrink-0 text-white shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
