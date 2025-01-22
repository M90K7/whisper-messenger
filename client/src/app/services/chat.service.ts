import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as signalR from "@microsoft/signalr";

import { ConfirmMessageDto, FileConfirmMessageDto, MessageDto } from "@app/models";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private readonly _urlSvc = inject(UrlService);

  constructor(private http: HttpClient) { }

  getChatHistory(receiverId: number, page: number) {
    return this.http.get<MessageDto[]>(this._urlSvc.chat.history + `/${receiverId}/${page}`);
  }

  sendMessage(messageData: MessageDto) {
    return this.http.post<ConfirmMessageDto>(this._urlSvc.chat.send, messageData);
  }

  sendFile(messageData: FormData) {
    return this.http.post<FileConfirmMessageDto>(this._urlSvc.chat.sendFile, messageData);
  }

  toCdnFile(url: string) {
    if (url) {
      return this._urlSvc.cdn.files + '/' + url;
    }
    return undefined;
  }

  getAdminChats() {
    return this.http.get<MessageDto[]>(this._urlSvc.chat.admin.list);
  }
}
