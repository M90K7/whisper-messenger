import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) { }

  getChatHistory(receiverId: number, page: number) {
    return this.http.get<any[]>(`/api/chat/history/${receiverId}/${page}`);
  }

  sendMessage(messageData: any) {
    return this.http.post('/api/chat/send', messageData);
  }
}
