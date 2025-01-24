import { Component, inject } from '@angular/core';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ChatService } from "@app/services";
import { MessageDto, snackError, snackSuccess } from "@app/models";
import { DateTimeFormatPipe } from "@app/pipes";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
  selector: 'app-messages',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    DateTimeFormatPipe
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {

  readonly _snackBar = inject(MatSnackBar);

  search?: string;

  displayedColumns: string[] = ["id", 'sender.fullName', 'receiver.fullName', "timestamp", "content", "filePath", "removed", "seen", "deleteAction"];
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

  deleteMessage(element: MessageDto) {
    this.chatSvc.deleteAdminChat(element.id!).subscribe({
      next: () => {
        this._snackBar.open("حذف با موفقیت انجام شد.", "", snackSuccess);
        this.dataSource.data.splice(
          this.dataSource.data.findIndex(data => data == element), 1
        );
        this.dataSource = new MatTableDataSource<MessageDto>(this.dataSource.data);
      }
    });
  }

}
