import { signal, WritableSignal } from "@angular/core";

export interface UserDto {
  id: number;
  userName: string;
  password: string;
  fullName: string;
  avatar?: string;
  online: boolean;
  newMessage?: boolean;
  role: string;
  email: string;
  uptimeMinutes: number;
}

export function decodeBase64Utf8(base64: string) {
  // Decode Base64 to a binary string
  const binaryString = atob(base64);

  // Convert binary string to a Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Decode UTF-8 bytes into a string
  const utf8String = new TextDecoder('utf-8').decode(bytes);
  return utf8String;
}
