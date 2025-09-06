
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  type?: string;
  toDate(): Date;
  toMillis(): number;
}

interface TimeRecordData {
  task: string;
  categoryId: string;
  duration: number; // 秒単位
}
// 保存用のインターフェース
export interface TimeRecordDataForSave extends TimeRecordData {
  startTime: Date
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 取得用のインターフェース
export interface TimeRecordDataForGet extends TimeRecordData {
  id: string;
  startTime: FirestoreTimestamp;
  endTime: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface TimeRecordFormData {
  task: string;
  categoryId: string;
  startTime: Date;
  endTime: Date;
} 