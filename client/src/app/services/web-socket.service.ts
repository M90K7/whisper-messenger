import { inject, Injectable } from '@angular/core';
import { Subject } from "rxjs";

import * as signalR from "@microsoft/signalr";

import { MessageDto, UserDto, FileConfirmMessageDto } from "@app/models";

import { UrlService } from "./url.service";
import { AuthService } from "./auth.service";

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private readonly _urlSvc = inject(UrlService);
  private readonly authSvc = inject(AuthService);

  private connection?: signalR.HubConnection;

  raiseError$ = new Subject<Error>();

  message$ = new Subject<MessageDto>();
  confirm$ = new Subject<FileConfirmMessageDto>();
  user$ = new Subject<UserDto>();

  constructor() {
  }

  start() {
    const token = this.authSvc.getToken();

    const authValue = `Bearer ${token!.token}`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this._urlSvc.baseSocket, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        logMessageContent: !environment.production,
        accessTokenFactory: () => this.authSvc.getToken()!.token
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on(this._urlSvc.chat.ws.message, (msg: MessageDto) => {
      this.message$.next(msg);
    });
    this.connection.on(this._urlSvc.chat.ws.confirm, (model: FileConfirmMessageDto) => {
      this.confirm$.next(model);
    });
    this.connection.on(this._urlSvc.user.ws.user, (model: UserDto) => {
      this.user$.next(model);
    });

    this.connection.start().catch((err) => {
      this.raiseError$.next(err);
      console.error(err);
    });
  }

  stop() {
    this.connection && this.connection.stop();
    this.connection = undefined;
    this.raiseError$.complete();
  }
}
