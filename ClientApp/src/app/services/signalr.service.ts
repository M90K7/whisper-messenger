import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/chatHub', {
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection established'))
      .catch((err: Error) => console.error('Error starting SignalR connection: ', err));
  }

  sendMessage(senderId: string, receiverId: string, message: string): void {
    this.hubConnection
      .invoke('SendMessage', senderId, receiverId, message)
      .catch((err: Error) => console.error('Error sending message: ', err));
  }

  onReceiveMessage(callback: (senderId: string, message: string) => void): void {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  onMessageSent(callback: (message: string) => void): void {
    this.hubConnection.on('MessageSent', callback);
  }
}
