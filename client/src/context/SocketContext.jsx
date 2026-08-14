import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, firebaseUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    let isMounted = true;

    const setupSocket = async () => {
      try {
        let token = localStorage.getItem('classsphere_token');
        if (firebaseUser) {
          try {
            token = await firebaseUser.getIdToken();
          } catch (e) {
            console.warn('[SocketContext] getIdToken error:', e);
          }
        }

        if (!token) {
          token = user.firebaseUid || user._id;
        }

        // Close any existing connection
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        const newSocket = io(SOCKET_URL, {
          auth: { token },
          query: { token },
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
          if (isMounted) {
            console.log('[Socket] Connected to server, ID:', newSocket.id);
            setIsConnected(true);
          }
        });

        newSocket.on('disconnect', (reason) => {
          if (isMounted) {
            console.log('[Socket] Disconnected from server. Reason:', reason);
            setIsConnected(false);
          }
        });

        newSocket.on('connect_error', (error) => {
          console.error('[Socket Connect Error]:', error.message);
          if (isMounted) {
            setIsConnected(false);
          }
        });

        socketRef.current = newSocket;
        if (isMounted) {
          setSocket(newSocket);
        }
      } catch (err) {
        console.error('[Socket Setup Error]:', err);
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, firebaseUser]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
