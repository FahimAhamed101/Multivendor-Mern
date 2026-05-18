"use client";

import React, { useEffect, createContext, useContext, ReactNode } from 'react';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';

interface SocketContextType {
  isConnected: boolean;
  socket: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('📍 SocketProvider - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token');

      if (token) {
        const socket = initializeSocket(token);
        setIsConnected(socket.connected);

        socket.on('connect', () => {
          setIsConnected(true);
          console.log('✅ Socket connected globally, ID:', socket.id);
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
          console.log('❌ Socket disconnected');
        });

        socket.on('connect_error', (error: any) => {
          console.error('❌ Socket connection error:', error.message);
        });

        return () => {
          socket.off('connect');
          socket.off('disconnect');
          socket.off('connect_error');
        };
      } else {
        console.warn('⚠️ No token found, socket not initialized');
      }
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  const socket = getSocket();

  return (
    <SocketContext.Provider value={{ isConnected, socket }}>
      {children}
    </SocketContext.Provider>
  );
};
