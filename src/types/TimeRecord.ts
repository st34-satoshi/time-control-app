export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  type?: string;
}

export interface TimeRecordData {
  id?: string;
  task: string;
  project: string;
  startTime: FirestoreTimestamp;
  endTime: FirestoreTimestamp;
  duration: number; // 秒単位
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface TimeRecordFormData {
  task: string;
  project: string;
  startTime: Date;
  endTime: Date;
} 