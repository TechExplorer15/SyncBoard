import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { 
  cardCreated, cardUpdated, cardMoved, cardDeleted,
  listCreated, listDeleted, presenceUpdated
} from '../store/slices/boardSlice';

// Make sure to use correct URL (default to localhost:5000 in dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  socket = io(API_BASE_URL, {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  // Real-time events
  socket.on('card_created', (card) => {
    store.dispatch(cardCreated(card));
  });

  socket.on('card_updated', (card) => {
    store.dispatch(cardUpdated(card));
  });

  socket.on('card_moved', (card) => {
    store.dispatch(cardMoved(card));
  });

  socket.on('card_deleted', (payload) => {
    store.dispatch(cardDeleted(payload));
  });

  socket.on('list_created', (list) => {
    store.dispatch(listCreated(list));
  });

  socket.on('list_deleted', (payload) => {
    store.dispatch(listDeleted(payload));
  });

  socket.on('presence_updated', (activeUsers) => {
    store.dispatch(presenceUpdated(activeUsers));
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinBoardRoom = (boardId: string) => {
  if (socket) {
    socket.emit('join_board', boardId);
  }
};

export const leaveBoardRoom = (boardId: string) => {
  if (socket) {
    socket.emit('leave_board', boardId);
  }
};

export const sendHeartbeat = (boardId: string) => {
  if (socket) {
    socket.emit('heartbeat', boardId);
  }
};
