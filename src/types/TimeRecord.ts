export interface TimeRecordData {
  id?: string;
  task: string;
  project: string;
  startTime: Date;
  endTime: Date;
  duration: number; // 秒単位
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeRecordFormData {
  task: string;
  project: string;
  startTime: Date;
  endTime: Date;
} 