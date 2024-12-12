
export interface AuthDto {
  token: string;
  expiresInMinutes: number;
}


export interface UserTokenModel {
  exp?: number; // Expiration time
  iat?: number; // Issued at
  sub: string; // Subject (user identifier)
  role?: string; // Custom claim for roles
  givenname?: string; // Custom claim for roles
  name?: string; // Custom claim for roles
  uri?: string; // Custom claim for roles
  emailaddress?: string; // Custom claim for roles
}