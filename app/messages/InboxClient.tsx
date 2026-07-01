"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, getUserConversations } from "@/lib/actions/messages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, MessageSquare, Send, Calendar, MapPin, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  listing_id: string;
  other_user_id: string;
  listing_title: string;
  listing_images: string[];
  other_user_name: string;
  other_user_university: string;
  other_user_avatar: string | null;
  latest_message: {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
  };
}

interface InboxClientProps {
  initialConversations: Conversation[];
  currentUserId: string;
}

export function InboxClient({ initialConversations, currentUserId }: InboxClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(
    initialConversations.length > 0 ? initialConversations[0] : null
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for messages when selection changes
  useEffect(() => {
    if (!selectedConv) {
      setMessages([]);
      return;
    }

    const fetchMsgs = async () => {
      try {
        const data = await getMessages(selectedConv.listing_id, selectedConv.other_user_id);
        setMessages(data);
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => clearInterval(interval);
  }, [selectedConv]);
  // Poll for conversations thread list to keep inbox up to date
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const data = await getUserConversations();
        setConversations(data);
      } catch (err) {
        console.error("Error polling conversations:", err);
      }
    };

    const interval = setInterval(fetchConvs, 4000);
    return () => clearInterval(interval);
  }, []);
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    // Optimistic UI message insertion
    const tempId = "temp-" + Date.now();
    const optimisticMessage = {
      id: tempId,
      content,
      sender_id: currentUserId,
      receiver_id: selectedConv.other_user_id,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendMessage(selectedConv.listing_id, content, selectedConv.other_user_id);
      
      // Update latest message in conversations sidebar
      setConversations((prevConvs) =>
        prevConvs.map((c) =>
          c.listing_id === selectedConv.listing_id && c.other_user_id === selectedConv.other_user_id
            ? {
                ...c,
                latest_message: {
                  id: tempId,
                  content,
                  sender_id: currentUserId,
                  receiver_id: selectedConv.other_user_id,
                  created_at: new Date().toISOString(),
                },
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message if sending fails
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden flex h-[calc(100vh-14rem)] min-h-[500px]">
      {/* Conversations Sidebar (Left Pane) */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
            <MessageSquare className="h-4.5 w-4.5 text-emerald-500" /> Inbox Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2 mt-12">
              <MessageSquare className="h-8 w-8 mx-auto opacity-30" />
              <p className="text-xs font-semibold">Your inbox is empty</p>
              <p className="text-[10px] text-slate-400">Sent and received messages will appear here.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected =
                selectedConv?.listing_id === conv.listing_id &&
                selectedConv?.other_user_id === conv.other_user_id;

              return (
                <button
                  key={`${conv.listing_id}:${conv.other_user_id}`}
                  onClick={() => setSelectedConv(conv)}
                  className={cn(
                    "w-full text-left p-4 flex gap-3 transition-colors duration-150 items-start cursor-pointer hover:bg-slate-50/50",
                    isSelected && "bg-emerald-50/40 hover:bg-emerald-50/40 border-l-4 border-emerald-500"
                  )}
                >
                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                    {conv.other_user_avatar ? (
                      <img src={conv.other_user_avatar} alt={conv.other_user_name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4.5 w-4.5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-bold text-slate-900 text-xs truncate leading-none">
                        {conv.other_user_name}
                      </h4>
                      <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                        {new Date(conv.latest_message.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 truncate leading-none">
                      {conv.listing_title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate leading-snug pt-0.5">
                      {conv.latest_message.content}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Window (Right Pane) */}
      <div className="hidden md:flex flex-col flex-1 bg-slate-50/30">
        {selectedConv ? (
          <>
            {/* Conversation Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {selectedConv.other_user_avatar ? (
                    <img src={selectedConv.other_user_avatar} alt={selectedConv.other_user_name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-none">{selectedConv.other_user_name}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{selectedConv.other_user_university}</p>
                </div>
              </div>

              {/* Sublease link preview card */}
              <div className="flex items-center gap-2 max-w-xs text-xs font-semibold bg-slate-50 border border-slate-200/50 rounded-2xl p-1.5 px-3">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate text-slate-700">{selectedConv.listing_title}</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={cn("flex items-start gap-2.5 max-w-lg", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    {!isMe && (
                      <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 border border-slate-300/40">
                        {selectedConv.other_user_avatar ? (
                          <img src={selectedConv.other_user_avatar} alt={selectedConv.other_user_name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-slate-500" />
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "rounded-2xl p-3.5 py-2.5 text-sm leading-relaxed",
                          isMe
                            ? "bg-emerald-600 text-white rounded-tr-none shadow-xs"
                            : "bg-white border border-slate-200/60 text-slate-800 rounded-tl-none shadow-2xs"
                        )}
                      >
                        {msg.content}
                      </div>
                      <p className={cn("text-[9px] text-slate-400 font-bold", isMe ? "text-right" : "text-left")}>
                        {new Date(msg.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  required
                  className="flex-1 h-10 border-slate-200 rounded-full px-4 focus:ring-emerald-50 focus:border-emerald-500 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || isSending}
                  className="rounded-full h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-4">
            <div className="rounded-full bg-slate-50 p-6 border">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-950 text-base">Select a conversation</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Choose a student chat from the left sidebar to view messages and coordinate subleases.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
