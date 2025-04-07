import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_BASE_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': '*'
  }
});
