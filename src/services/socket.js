import { io } from 'socket.io-client';
import { getToken, WS_URL } from './api';

let socket = null;
let dataChangeCallback = null;

export const initSocket = (onDataChange) => {
  if (socket) {
    dataChangeCallback = onDataChange;
    return socket;
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    const token = getToken();
    if (token) {
      socket.emit('authenticate', token);
    }
  });

  socket.on('dataChange', (data) => {
    if (dataChangeCallback) {
      dataChangeCallback(data);
    }
  });

  socket.on('disconnect', () => {
  });

  dataChangeCallback = onDataChange;
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    dataChangeCallback = null;
  }
};
