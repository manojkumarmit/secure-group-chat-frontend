import { io, Socket } from 'socket.io-client';

// This file establishes a connection to the Socket.IO server.
// It imports necessary modules from 'socket.io-client' to create a socket instance.
// The socket instance is configured to connect to the server URL defined in the environment variables.
// If the environment variable is not set, it defaults to 'http://localhost:5000'.
// The socket is set to automatically connect and use the 'websocket' transport for communication.
// const SOCKET_URL = '/socket.io';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;