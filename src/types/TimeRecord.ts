export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  type?: string;
}

export interface TimeRecordData {
  id?: string;
  task: string;
  category: string;
  startTime: Date;
  endTime: Date;
  duration: number; // 秒単位
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeRecordFormData {
  task: string;
  category: string;
  startTime: Date;
  endTime: Date;
} 