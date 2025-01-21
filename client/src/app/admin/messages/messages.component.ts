import { Component, inject } from '@angular/core';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ChatService } from "@app/services";
import { MessageDto } from "@app/models";

@Component({
  selector: 'app-messages',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {

  search?: string;

  displayedColumns: string[] = ['sender.fullName', 'receiver.fullName'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource = new MatTableDataSource<MessageDto>([]);

  chatSvc = inject(ChatService);

  constructor() {
    this.chatSvc.getAdminChats().subscribe({
      next: (messages) => {
        this.dataSource = new MatTableDataSource(messages);
      }
    });
  }

}
