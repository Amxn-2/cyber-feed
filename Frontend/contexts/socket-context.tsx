'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastIncident: any | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastIncident: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastIncident, setLastIncident] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('new_incident', (incident: any) => {
      setLastIncident(incident);
      toast({
        title: "🚨 NEW THREAT DETECTED",
        description: incident.title,
        variant: incident.severity === 'Critical' ? 'destructive' : 'default',
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastIncident }}>
      {children}
    </SocketContext.Provider>
  );
};
