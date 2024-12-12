
export interface MessageDto {
  id?: number;
  senderId?: number;
  receiverId?: number;
  content?: string;
  filePath?: string;
  seen?: boolean;

  dataFa?: string;
  timeFa?: string;
}