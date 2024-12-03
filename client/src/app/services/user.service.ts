import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { UserDto } from "@app/models";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<UserDto[]>('/api/user/list');
  }

  // Get the current user's profile
  getProfile() {
    return this.http.get('/api/user/profile');
  }

  // Update the user's profile
  updateProfile(profileData: any) {
    return this.http.put('/api/user/update-profile', profileData);
  }

}
