
export interface MessageDto {
  id?: number;
  senderId?: number;
  receiverId?: number;
  content?: string;
  filePath?: string;
  seen?: boolean;
  dataFa?: string;
  timeFa?: string;
  status: number;
  timestamp?: string;
}

export interface ConfirmMessageDto {
  messageId: number;
  receiverId: number;
  timestamp: string;
}

export interface FileConfirmMessageDto extends ConfirmMessageDto {
  filePath: string;
}