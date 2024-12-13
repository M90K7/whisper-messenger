
export interface AuthDto {
  token: string;
  expiresInMinutes: number;
}


export interface UserTokenModel {
  sub: string; // Subject (user identifier)
  email?: string; // Custom claim for roles
  given_name?: string; // Custom claim for roles
  name?: string; // Custom claim for roles
  exp?: number; // Expiration time
  iat?: number; // Issued at
  role?: string; // Custom claim for roles
  avatar?: string; // Custom claim for roles
}