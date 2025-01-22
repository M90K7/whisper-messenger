import { Component, inject } from '@angular/core';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ChatService } from "@app/services";
import { MessageDto } from "@app/models";
import { DateTimeFormatPipe } from "@app/pipes";

@Component({
  selector: 'app-messages',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,

    DateTimeFormatPipe
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {

  search?: string;

  displayedColumns: string[] = ["id", 'sender.fullName', 'receiver.fullName', "timestamp", "content", "filePath", "removed", "seen"];
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
