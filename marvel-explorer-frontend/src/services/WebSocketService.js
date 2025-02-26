import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.connectionListeners = new Set();
  }

  connect(serverUrl = process.env.REACT_APP_API_URL ) {
    if (this.socket) {
      return;
    }

    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.notifyConnectionListeners(true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.notifyConnectionListeners(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
      this.notifyConnectionListeners(false);
    });

    // Set up the progress update listener
    this.socket.on('progressUpdate', (data) => {
      console.debug('Progress update received:', data);
      const { taskId } = data;

      // Notify task-specific listeners
      if (this.listeners.has(taskId)) {
        this.listeners.get(taskId).forEach(callback => callback(data));
      }

      // Notify global progress listeners
      if (this.listeners.has('all')) {
        this.listeners.get('all').forEach(callback => callback(data));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  onProgress(taskId, callback) {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, new Set());
    }

    this.listeners.get(taskId).add(callback);

    // Return a function to unsubscribe
    return () => {
      if (this.listeners.has(taskId)) {
        this.listeners.get(taskId).delete(callback);

        // If no more listeners for this taskId, clean up
        if (this.listeners.get(taskId).size === 0) {
          this.listeners.delete(taskId);
        }
      }
    };
  }

  onConnection(callback) {
    this.connectionListeners.add(callback);

    // Immediately notify of current state
    if (this.socket) {
      callback(this.connected);
    }

    // Return a function to unsubscribe
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  notifyConnectionListeners(status) {
    this.connectionListeners.forEach(callback => callback(status));
  }

  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
