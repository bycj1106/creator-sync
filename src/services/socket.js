import { io } from 'socket.io-client';
import { getToken } from './api';

let socket = null;

export const initSocket = (onDataChange) => {
  if (socket) return socket;

  socket = io('http://localhost:3001', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    const token = getToken();
    if (token) {
      socket.emit('authenticate', token);
    }
  });

  socket.on('dataChange', (data) => {
    console.log('Data changed:', data);
    if (onDataChange) {
      onDataChange(data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
