import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  role?: string;
}

interface WebSocketMessage {
  type: 'notification' | 'job_match' | 'application_update' | 'contract_update';
  data: any;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      console.log('WebSocket connection established');

      // Extract user info from query params or headers
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const userId = url.searchParams.get('userId');
      const role = url.searchParams.get('role');

      if (userId) {
        ws.userId = userId;
        ws.role = role || 'professional';
        
        // Add to clients map
        if (!this.clients.has(userId)) {
          this.clients.set(userId, []);
        }
        this.clients.get(userId)!.push(ws);
      }

      ws.on('message', (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          this.handleMessage(ws, parsedMessage);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        if (ws.userId) {
          const userClients = this.clients.get(ws.userId);
          if (userClients) {
            const index = userClients.indexOf(ws);
            if (index > -1) {
              userClients.splice(index, 1);
            }
            if (userClients.length === 0) {
              this.clients.delete(ws.userId);
            }
          }
        }
      });

      // Send initial connection confirmation
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'connection',
          data: { status: 'connected', userId: ws.userId }
        }));
      }
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: any) {
    // Handle incoming messages from clients
    switch (message.type) {
      case 'ping':
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'pong', data: { timestamp: Date.now() } }));
        }
        break;
      case 'subscribe':
        // Handle subscription to specific channels
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Send notification to specific user
  public sendNotification(userId: string, notification: WebSocketMessage) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify(notification);
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  // Send notification to users by role
  public sendToRole(role: string, notification: WebSocketMessage) {
    const message = JSON.stringify(notification);
    this.clients.forEach((clients, userId) => {
      clients.forEach(client => {
        if (client.role === role && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  }

  // Send job match notification to professionals
  public notifyJobMatch(userId: string, jobData: any) {
    this.sendNotification(userId, {
      type: 'job_match',
      data: {
        title: 'New Job Match!',
        message: `A new job matching your skills is available: ${jobData.title}`,
        jobId: jobData.id,
        matchScore: jobData.matchScore
      }
    });
  }

  // Send application update to professional
  public notifyApplicationUpdate(userId: string, applicationData: any) {
    this.sendNotification(userId, {
      type: 'application_update',
      data: {
        title: 'Application Update',
        message: `Your application status has been updated to: ${applicationData.status}`,
        applicationId: applicationData.id,
        status: applicationData.status
      }
    });
  }

  // Send contract update
  public notifyContractUpdate(userId: string, contractData: any) {
    this.sendNotification(userId, {
      type: 'contract_update',
      data: {
        title: 'Contract Update',
        message: `Contract ${contractData.title} status: ${contractData.status}`,
        contractId: contractData.id,
        status: contractData.status
      }
    });
  }

  // Get connected clients count
  public getConnectedClientsCount(): number {
    let count = 0;
    this.clients.forEach(clients => count += clients.length);
    return count;
  }

  // Get connected clients by role
  public getClientsByRole(role: string): number {
    let count = 0;
    this.clients.forEach(clients => {
      clients.forEach(client => {
        if (client.role === role) count++;
      });
    });
    return count;
  }
}

let wsService: WebSocketService;

export function initializeWebSocket(server: Server): WebSocketService {
  wsService = new WebSocketService(server);
  return wsService;
}

export function getWebSocketService(): WebSocketService {
  return wsService;
}
