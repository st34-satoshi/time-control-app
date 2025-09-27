export interface Category {
  id?: string;
  value: string;
  label: string;
  icon: string;
  color?: string;
  order?: number;
  hidden?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 