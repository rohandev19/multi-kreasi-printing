import React, { useState, useEffect, useRef } from 'react';
import { PaperPlaneRight, ChatCircleDots, X } from '@phosphor-icons/react';
import { useSocket } from '../../contexts/SocketContext';
import { useRoleContext } from '../../contexts/RoleContext';
import api from '../../api/axios';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    role?: {
      name: string;
    };
  };
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const { socket, isConnected } = useSocket();
  const { user } = useRoleContext();
  const isAuthenticated = !!user;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user && !roomId) {
      // Only customers auto-initiate chat this way, admins have a different view
      if (user.role === 'Customer' || !user.role) {
        api.post('/chats/init', {})
          .then(res => {
            setRoomId(res.data.id);
            if (socket) {
              socket.emit('joinRoom', { roomId: res.data.id });
            }
            return api.get(`/chats/${res.data.id}/messages`);
          })
          .then(res => {
            // Handle both new paginated { data, nextCursor } format and legacy array format
            const messagesList = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setMessages(messagesList);
          })
          .catch(err => console.error('Failed to init chat', err));
      }
    }
  }, [isOpen, isAuthenticated, user, roomId, socket]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !socket) return;

    socket.emit('sendMessage', {
      roomId,
      message: newMessage,
    });
    setNewMessage('');
  };

  // If not authenticated or is admin, maybe don't show the floating widget
  // (Admins might have a dedicated dashboard page for chats)
  if (!isAuthenticated || (user && user.role !== 'Customer')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        } transition-all duration-300 bg-black hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl flex items-center justify-center`}
      >
        <ChatCircleDots size={28} weight="fill" />
      </button>

      {/* Chat Window */}
      <div
        className={`${
          isOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-10 opacity-0 pointer-events-none'
        } transition-all duration-300 absolute bottom-0 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200`}
        style={{ height: '500px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg leading-tight">Layanan Bantuan Langsung</h3>
            <p className="text-slate-300 text-xs">
              {isConnected ? 'Online - Kami siap membantu Anda' : 'Menghubungkan...'}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-300 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div className="text-neutral-400">
                <ChatCircleDots size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Halo! Ada yang bisa kami bantu hari ini?</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.id;
              const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <span className="text-xs text-neutral-500 mb-1 ml-1">
                      {msg.sender?.fullName || 'Dukungan Pelanggan'}
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? 'bg-black text-white rounded-tr-sm'
                        : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm" style={{ wordBreak: 'break-word' }}>{msg.message}</p>
                    <span
                      className={`text-[10px] mt-1 block ${
                        isMe ? 'text-slate-400 text-right' : 'text-neutral-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-neutral-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan Anda..."
              className="flex-1 bg-neutral-100 border-none focus:ring-2 focus:ring-slate-900 rounded-full px-4 py-2 text-sm outline-none"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-black text-white p-2.5 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <PaperPlaneRight size={18} weight="fill" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
