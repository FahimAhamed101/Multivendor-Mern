


'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import Image from 'next/image';
import {
  useGetSupportListQuery,
  useGetSupportMessagesQuery,
  useSendSupportMessageMutation,
  useInitSupportMutation,
} from '@/redux/features/support/supportMessageSlice';
import { useSupportModal } from '@/context/SupportModalContext';

export default function SupportMessage() {

  const { isOpen, setIsOpen, closeSupport } = useSupportModal();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Get support list to extract chatId
  const { data: supportList, refetch: refetchSupportList } = useGetSupportListQuery({});
  const chatId = supportList?.data?._id;
  // console.log(supportList);

  // 2. Get messages by chatId (skip if no chatId yet)
  const { data: chatMessages, refetch: refetchMessages } = useGetSupportMessagesQuery(
    chatId || '',
    {
      skip: !chatId,
      pollingInterval: 5000,
    }
  );

  const messages = chatMessages?.data || [];

  // 3. Send message mutation
  const [sendSupportMessage, { isLoading: isSending }] = useSendSupportMessageMutation();

  // 4. Init support (first time — no chatId)
  const [initSupport, { isLoading: isIniting }] = useInitSupportMutation();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      if (!chatId) {
        // ── First message ever: init support chat then send ──
        const initRes = await initSupport({
          message: messageText,
        }).unwrap();

        // After init, refetch support list to get the new chatId
        await refetchSupportList();
        return;
      }

      // ── Normal send ──
      await sendSupportMessage({
        chatId,
        body: { message: messageText },
      }).unwrap();

      refetchMessages();
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMyMessage = (senderRole: string) =>
    senderRole === 'customer' || senderRole === 'vendor';

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const isLoading = isSending || isIniting;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 text-white p-0 rounded-full shadow-2xl z-50 cursor-pointer transition-all duration-300 transform hover:scale-110"
        aria-label="Open support chat"
      >
        <div className="relative">
          <Image
            src="/images/messageicon.png"
            alt="Support"
            width={50}
            height={50}
            className="transition-transform duration-300"
          />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {messages.filter((m: any) => !m.isRead && !isMyMessage(m.senderRole)).length || 0}
          </span>
        </div>
      </button>

      {/* Chat Modal — inset-x on small screens so w-96 never overflows the viewport */}
      {isOpen && (
        <div className="fixed bottom-20 inset-x-4 z-50 sm:inset-x-auto sm:right-6 sm:left-auto">
          <div className="bg-gray-900 rounded-2xl w-full max-w-[calc(100vw-2rem)] sm:w-96 sm:max-w-none h-[min(520px,calc(100vh-8rem))] flex flex-col shadow-2xl border border-gray-700 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 rounded-t-2xl bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Support Chat</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="text-xs text-green-400">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={closeSupport}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Start a conversation</p>
                  <p className="text-gray-600 text-xs text-center">
                    Send a message to connect with our support team.
                  </p>
                </div>
              )}

              {messages.map((message: any) => {
                const mine = isMyMessage(message.senderRole);
                return (
                  <div
                    key={message._id}
                    className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Admin avatar */}
                    {!mine && (
                      <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-500 px-1">
                        {mine ? 'You' : message.senderId?.name || 'Support'}
                      </span>

                      {/* Attachments */}
                      {message.attachments?.length > 0 && (
                        <div className={`flex flex-wrap gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                          {message.attachments.map((att: string, i: number) => (
                            <div key={i} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                              📎 {att}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Bubble */}
                      {message.content && (
                        <div className={`px-3 py-2 rounded-2xl text-sm ${
                          mine
                            ? 'bg-purple-600 text-white rounded-br-sm'
                            : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                        }`}>
                          <p>{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                            <p className={`text-xs ${mine ? 'text-purple-300' : 'text-gray-400'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                            {mine && (
                              <span className={`text-xs ${message.isRead ? 'text-blue-400' : 'text-gray-500'}`}>
                                {message.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer avatar */}
                    {mine && (
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-700">
              {/* First message hint */}
              {!chatId && (
                <p className="text-xs text-gray-500 mb-2 text-center">
                  Your first message will create a support ticket 🎫
                </p>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={chatId ? 'Type your message...' : 'Type your first message...'}
                  className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none border border-gray-700"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
                    newMessage.trim() && !isLoading
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}