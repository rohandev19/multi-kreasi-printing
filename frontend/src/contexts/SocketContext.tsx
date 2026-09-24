import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoleContext } from './RoleContext';
import { useToast } from './ToastContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useRoleContext();
  const { addToast } = useToast();

  useEffect(() => {
    // Only connect if the user is authenticated
    const token = localStorage.getItem('token');
    
    if (user && token) {
      const runtimeApiUrl = typeof window !== 'undefined' ? (window as any).__API_URL__ : undefined;
      const buildTimeApiUrl = import.meta.env.VITE_API_URL;
      const fallbackUrl = 'http://localhost:3000';
      const apiUrl = runtimeApiUrl || buildTimeApiUrl || fallbackUrl;

      // Connect to the backend
      const socketInstance = io(apiUrl, {
        auth: {
          token: `Bearer ${token}`
        },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Listen for notifications globally
      socketInstance.on('notification:new', (notification: any) => {
        console.log('New notification:', notification);
        addToast({
          title: 'Notifikasi Baru',
          message: notification.message || 'Anda memiliki pemberitahuan baru.',
          type: 'info',
        });
      });

      setSocket(socketInstance);

      // Cleanup on unmount or when user changes
      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
