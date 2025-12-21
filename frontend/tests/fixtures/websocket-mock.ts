/**
 * WebSocket mock server for testing
 */

import { Page } from '@playwright/test';

export interface MockWebSocketMessage {
  type: string;
  data?: any;
}

/**
 * Mock WebSocket server for browser tests
 */
export class MockWebSocketServer {
  private page: Page;
  private messages: MockWebSocketMessage[] = [];
  
  constructor(page: Page) {
    this.page = page;
  }
  
  /**
   * Initialize mock WebSocket in the browser
   */
  async initialize() {
    await this.page.addInitScript(() => {
      const originalWebSocket = window.WebSocket;
      const messageQueue: any[] = [];
      let mockWs: any = null;
      
      // @ts-ignore
      window.WebSocket = class MockWebSocket {
        url: string;
        readyState: number;
        onopen: ((event: any) => void) | null = null;
        onmessage: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        onclose: ((event: any) => void) | null = null;
        
        constructor(url: string) {
          this.url = url;
          this.readyState = 0; // CONNECTING
          
          // Store reference for message injection
          mockWs = this;
          
          // Simulate connection opened
          setTimeout(() => {
            this.readyState = 1; // OPEN
            if (this.onopen) {
              this.onopen({ type: 'open' });
            }
            
            // Send queued messages
            messageQueue.forEach(msg => {
              if (this.onmessage) {
                this.onmessage({ data: JSON.stringify(msg) });
              }
            });
            messageQueue.length = 0;
          }, 100);
        }
        
        send(data: string) {
          // Mock send - could be extended to capture sent messages
          console.log('[MockWebSocket] Send:', data);
        }
        
        close() {
          this.readyState = 3; // CLOSED
          if (this.onclose) {
            this.onclose({ type: 'close' });
          }
        }
        
        addEventListener(event: string, handler: any) {
          if (event === 'open') this.onopen = handler;
          if (event === 'message') this.onmessage = handler;
          if (event === 'error') this.onerror = handler;
          if (event === 'close') this.onclose = handler;
        }
        
        removeEventListener(event: string, handler: any) {
          if (event === 'open' && this.onopen === handler) this.onopen = null;
          if (event === 'message' && this.onmessage === handler) this.onmessage = null;
          if (event === 'error' && this.onerror === handler) this.onerror = null;
          if (event === 'close' && this.onclose === handler) this.onclose = null;
        }
      };
      
      // Expose function to inject messages
      // @ts-ignore
      window.__mockWsSendMessage = (message: any) => {
        if (mockWs && mockWs.readyState === 1) {
          if (mockWs.onmessage) {
            mockWs.onmessage({ data: JSON.stringify(message) });
          }
        } else {
          messageQueue.push(message);
        }
      };
    });
  }
  
  /**
   * Send a message through the mock WebSocket
   */
  async sendMessage(message: MockWebSocketMessage) {
    this.messages.push(message);
    await this.page.evaluate((msg) => {
      // @ts-ignore
      window.__mockWsSendMessage(msg);
    }, message);
  }
  
  /**
   * Send timer update event
   */
  async sendTimerUpdate(timerId: string, action: string = 'created') {
    await this.sendMessage({
      type: 'timer_update',
      data: {
        timer_id: timerId,
        action,
        message: `Timer ${action}`,
      },
    });
  }
  
  /**
   * Send timer warning event
   */
  async sendTimerWarning(timerId: string) {
    await this.sendMessage({
      type: 'timer_warning',
      data: {
        timer_id: timerId,
        message: '3 minutes remaining',
      },
    });
  }
  
  /**
   * Send timer completed event
   */
  async sendTimerCompleted(timerId: string) {
    await this.sendMessage({
      type: 'timer_completed',
      data: {
        timer_id: timerId,
        message: 'Timer completed',
      },
    });
  }
  
  /**
   * Send connection established event
   */
  async sendConnectionEstablished() {
    await this.sendMessage({
      type: 'connection_established',
      data: {
        message: 'WebSocket connected',
      },
    });
  }
  
  /**
   * Get all sent messages
   */
  getMessages() {
    return this.messages;
  }
  
  /**
   * Clear message history
   */
  clearMessages() {
    this.messages = [];
  }
}

/**
 * Create a mock WebSocket server for testing
 */
export async function createMockWebSocket(page: Page): Promise<MockWebSocketServer> {
  const server = new MockWebSocketServer(page);
  await server.initialize();
  return server;
}
