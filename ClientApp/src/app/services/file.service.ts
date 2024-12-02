import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) { }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<string>('/api/file/upload', formData);
  }
}
