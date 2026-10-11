import React, { useState, useEffect, useRef } from 'react';
import { PaperPlaneRight, UserCircle, ChatCircleDots, Clock } from '@phosphor-icons/react';
import api from '../api/axios';
import { useSocket } from '../contexts/SocketContext';
import { useRoleContext } from '../contexts/RoleContext';

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

interface ChatRoom {
  id: string;
  customerId: string;
  orderId?: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  messages: {
    message: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  }[];
}

export default function LiveSupport() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const { socket, isConnected } = useSocket();
  const { user } = useRoleContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all chat rooms
  const fetchRooms = async () => {
    try {
      const res = await api.get('/chats/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch messages for selected room
  useEffect(() => {
    if (selectedRoomId) {
      api.get(`/chats/${selectedRoomId}/messages`)
        .then(res => {
          const messagesList = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setMessages(messagesList);
        })
        .catch(err => console.error('Failed to fetch messages', err));
      
      // Mark as read when selecting
      api.post(`/chats/${selectedRoomId}/read`).catch(() => {});
      
      // Join the room to receive newMessage events
      if (socket) {
        socket.emit('joinRoom', { roomId: selectedRoomId });
      }
    } else {
      setMessages([]);
    }
  }, [selectedRoomId, socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for new messages globally
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Update messages if the message belongs to the selected room
      if (message.roomId === selectedRoomId) {
        setMessages(prev => [...prev, message]);
        // Also mark as read since we are viewing it
        api.post(`/chats/${selectedRoomId}/read`).catch(() => {});
      }
      
      // Refresh rooms list to update latest message and ordering
      fetchRooms();
    };
    
    const handleChatNotification = () => {
      // Re-fetch rooms when a customer sends a message to any room
      fetchRooms();
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chatNotification', handleChatNotification);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('chatNotification', handleChatNotification);
    };
  }, [socket, selectedRoomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId || !socket) return;

    socket.emit('sendMessage', {
      roomId: selectedRoomId,
      message: newMessage,
    });
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-neutral-50 overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 min-w-[300px] border-r border-neutral-200 bg-white flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
            <ChatCircleDots size={24} className="text-primary-600" weight="fill" />
            Bantuan Langsung
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isConnected ? (
              <span className="text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Terhubung ke server pesan
              </span>
            ) : (
              <span className="text-orange-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                Menghubungkan...
              </span>
            )}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              <p>Tidak ada percakapan aktif.</p>
            </div>
          ) : (
            rooms.map(room => {
              const latestMessage = room.messages[0];
              const isUnread = latestMessage && !latestMessage.isRead && latestMessage.senderId !== user?.id;
              const isSelected = selectedRoomId === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-4 border-b border-neutral-100 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <UserCircle size={24} className="text-neutral-400" />
                      <span className={`font-medium ${isUnread ? 'text-neutral-900 font-semibold' : 'text-neutral-700'}`}>
                        {room.customer.fullName}
                      </span>
                    </div>
                    {latestMessage && (
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pl-8">
                    <p className={`text-sm truncate pr-4 ${isUnread ? 'text-neutral-900 font-medium' : 'text-neutral-500'}`}>
                      {latestMessage ? latestMessage.message : 'Belum ada pesan'}
                    </p>
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0"></span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        {selectedRoomId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 bg-white border-b border-neutral-200 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  <UserCircle size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">
                    {rooms.find(r => r.id === selectedRoomId)?.customer.fullName}
                  </h3>
                  <span className="text-xs text-green-600">Aktif</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.id;
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <span className="text-xs text-neutral-500 mb-1 ml-1">
                        {msg.sender?.fullName || 'Pelanggan'}
                      </span>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-tr-sm shadow-md'
                          : 'bg-white text-neutral-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-[15px]" style={{ wordBreak: 'break-word' }}>{msg.message}</p>
                      <span
                        className={`text-[11px] mt-1 block ${
                          isMe ? 'text-primary-200 text-right' : 'text-neutral-400'
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
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-neutral-200">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik balasan pesan..."
                  disabled={!isConnected}
                  className="flex-1 bg-neutral-100 border border-transparent focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="bg-black text-white px-5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                >
                  <PaperPlaneRight size={20} weight="fill" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <ChatCircleDots size={64} className="mb-4 opacity-20" weight="fill" />
            <h3 className="text-lg font-medium text-neutral-500">Belum Ada Obrolan Dipilih</h3>
            <p className="text-sm">Pilih percakapan dari daftar di samping untuk mulai membalas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
