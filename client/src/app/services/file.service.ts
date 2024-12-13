import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileConfirmMessageDto } from "@app/models";

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) { }


}
