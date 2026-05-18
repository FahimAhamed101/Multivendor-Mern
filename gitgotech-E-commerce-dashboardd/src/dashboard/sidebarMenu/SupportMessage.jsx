


import { FileText, Image as ImageIcon, Loader2, Paperclip, Search, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGetSupportListQuery, useGetSupportMessagesQuery, useSendSupportMessageMutation } from '../../redux/features/supportMessageSlice/supportMessageSlice';

const SupportPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const chatsPerPage = 10;
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { data: supportListData, isLoading: isSupportListLoading, refetch: refetchChats } = useGetSupportListQuery({ page: currentPage, limit: chatsPerPage });
 
  // ✅ ONLY CHANGE: added pollingInterval: 5000 for real-time admin messages
  const { data: supportMessagesData, isLoading: isMessagesLoading, refetch: refetchMessages } = useGetSupportMessagesQuery(selectedChat?._id, {
    skip: !selectedChat?._id,
    pollingInterval: 5000,
  });

  const [sendSupportMessage, { isLoading: isSendingMessage }] = useSendSupportMessageMutation();

  // Extract chats from API response
  const chats = supportListData?.data?.data || [];
  const meta = supportListData?.data?.meta || {};
  const totalPages = meta.totalPages || 1;

  // Extract messages
  const messages = supportMessagesData?.data || [];

  // Set first chat as default selected
  useEffect(() => {
    if (!selectedChat && chats.length > 0) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMessagesLoading]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessageInput('');
    setAttachments([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    if (!selectedChat?._id) return;

    try {
      const formData = new FormData();
      
      // Add message data as JSON string
      const dataObj = { message: messageInput.trim() };
      console.log(dataObj, selectedChat._id);
      formData.append('data', JSON.stringify(dataObj));

      // Add attachments
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      await sendSupportMessage({
        chatId: selectedChat._id,
        formData,
      }).unwrap();

      setMessageInput('');
      setAttachments([]);
      refetchMessages();
      refetchChats();
    } catch (error) {
      console.error('Send message error:', error);
      alert(`Failed to send message: ${error?.data?.message || error.message}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isFileImage = (file) => {
    return file?.type?.startsWith('image/');
  };

  const getFileName = (file) => {
    if (file.name.length > 20) {
      return file.name.substring(0, 15) + '...' + file.name.split('.').pop();
    }
    return file.name;
  };

  const getFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const filteredChats = chats.filter((chat) => {
    const userName = chat.user?.name?.toLowerCase() || '';
    const userEmail = chat.user?.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return userName.includes(search) || userEmail.includes(search);
  });


  

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold font-cormorant text-white mb-8">Support</h1>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Chats List */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#1e1e28] to-[#16161f] rounded-2xl border border-purple-500/30 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-purple-500/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </div>

            {/* Chats List */}
            <div className="overflow-y-auto max-h-[600px]">
              {isSupportListLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-400 text-sm">No conversations found</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-purple-500/10 ${
                      selectedChat?._id === chat._id
                        ? 'bg-purple-600/20 border-l-4 border-l-purple-600'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Avatar */}
                    {chat.user?.image && chat.user.image !== '' ? (
                      <img
                        src={chat.user.image}
                        alt={chat.user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 border-2 border-purple-500/30">
                        <span className="text-sm font-semibold text-purple-300">
                          {chat.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {chat.user?.name || 'Unknown User'}
                        </h3>
                        <span className="text-gray-500 text-xs whitespace-nowrap ml-2">
                          {formatDate(chat.lastMessageAt || chat.updatedAt)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{chat.user?.email || ''}</p>
                      {chat.lastMessage && (
                        <p className="text-gray-500 text-xs truncate mt-0.5">
                          {chat.lastMessage}
                        </p>
                      )}
                    </div>

                    {/* Status indicator */}
                    {chat.user?.isOnline && (
                      <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-[#1e1e28] flex-shrink-0"></div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-purple-500/20">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded text-xs font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-xs">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded text-xs font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Message View */}
          <div className="lg:col-span-8 bg-gradient-to-br from-[#1e1e28] to-[#16161f] rounded-2xl border border-purple-500/30 overflow-hidden flex flex-col" style={{ minHeight: '600px', maxHeight: '700px' }}>
            {selectedChat ? (
              <>
                {/* User Header */}
                <div className="p-6 border-b border-purple-500/20 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    {selectedChat.user?.image && selectedChat.user.image !== '' ? (
                      <img
                        src={selectedChat.user.image}
                        alt={selectedChat.user.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-purple-500/30 flex items-center justify-center border-2 border-purple-500/30">
                        <span className="text-lg font-semibold text-purple-300">
                          {selectedChat.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-white text-lg font-bold mb-1">
                        {selectedChat.user?.name || 'Unknown User'}
                      </h2>
                      <p className="text-gray-400 text-sm">{selectedChat.user?.email || ''}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          selectedChat.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {selectedChat.status}
                        </span>
                        {selectedChat.user?.isOnline && (
                          <span className="text-green-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: '300px' }}>
                  {isMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const role = (msg.senderRole || '').toLowerCase();
                        // Support staff on the right; vendor/customer and other non-staff on the left
                        const isSupportMessage = ['admin', 'manager', 'support'].includes(role);
                        return (
                          <div
                            key={msg._id || index}
                            className={`flex ${isSupportMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] ${isSupportMessage ? 'order-2' : 'order-1'}`}>
                              {/* Sender Info */}
                              <div className={`flex items-center gap-2 mb-1 ${isSupportMessage ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-gray-400 text-xs">
                                  {msg.senderId?.name || 'Unknown'}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                              </div>
                              
                              {/* Message Bubble */}
                              <div
                                className={`px-4 py-3 rounded-2xl ${
                                  isSupportMessage
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm'
                                    : 'bg-[#1a1a1f] border border-purple-500/20 text-gray-300 rounded-tl-sm'
                                }`}
                              >
                                {msg.content && (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                )}
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {msg.attachments.map((attachment, attIndex) => (
                                      <div key={attIndex} className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                                        {attachment.url && isFileImage(attachment) ? (
                                          <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        ) : (
                                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        )}
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-purple-300 hover:text-purple-200 truncate"
                                        >
                                          {attachment.name || 'Attachment'}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Read Status */}
                              {msg.isRead && isSupportMessage && (
                                <p className="text-gray-500 text-xs mt-1 text-right">✓ Read</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="px-6 py-3 border-t border-purple-500/20 flex-shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-400 text-xs mr-2">Attachments:</span>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-[#1a1a1f] border border-purple-500/20 rounded-lg px-3 py-2">
                          {isFileImage(file) ? (
                            <ImageIcon className="w-4 h-4 text-purple-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-purple-400" />
                          )}
                          <span className="text-gray-300 text-xs max-w-[100px] truncate">{getFileName(file)}</span>
                          <span className="text-gray-500 text-xs">({getFileSize(file.size)})</span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-6 border-t border-purple-500/20 flex-shrink-0">
                  <div className="flex items-end gap-3">
                    {/* Attachment Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-lg bg-[#1a1a1f] border border-purple-500/30 text-gray-400 hover:text-purple-400 hover:border-purple-500/60 transition-colors flex-shrink-0"
                      disabled={isSendingMessage}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />

                    {/* Message Input */}
                    <div className="flex-1">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full px-4 py-3 bg-[#1a1a1f] border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 resize-none"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        disabled={isSendingMessage}
                      />
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || (!messageInput.trim() && attachments.length === 0)}
                      className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-lg">Select a conversation to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;