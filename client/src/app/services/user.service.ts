import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { UserDto } from "@app/models";
import { AuthService } from "./auth.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, readonly urlSvc: UrlService, readonly authSvc: AuthService) { }

  getAdminUsers() {
    return this.http.get<UserDto[]>(this.urlSvc.user.admin.list);
  }

  getUsers() {
    return this.http.get<UserDto[]>(this.urlSvc.user.list);
  }

  // Get the current user's profile
  getProfile() {
    return this.http.get('/api/user/profile');
  }

  create(profileData: UserDto) {
    return this.http.post<UserDto>(this.urlSvc.user.admin.create, profileData);
  }

  private updateAdmin(profileData: Partial<UserDto>) {
    return this.http.put(this.urlSvc.user.admin.update, profileData);
  }

  // Update the user's profile
  update(profileData: Partial<UserDto>, isAdmin: boolean = false) {
    delete profileData.online;

    if (isAdmin) {
      return this.updateAdmin(profileData);
    }

    delete profileData.role;
    return this.http.put(this.urlSvc.user.update, profileData);
  }

  updateAvatar(profileData: FormData) {
    return this.http.put<UserDto>(this.urlSvc.user.avatar, profileData);
  }

  delete(userId: number) {
    return (this.http.delete(this.urlSvc.user.admin.delete + `/${userId}`));
  }

}