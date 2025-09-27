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

// プリセットカラー（グラフで見やすい色を選択）
export const PRESET_COLORS = [
  '#3b82f6', // 青
  '#ef4444', // 赤
  '#10b981', // 緑
  '#f59e0b', // オレンジ
  '#8b5cf6', // 紫
  '#06b6d4', // シアン
  '#84cc16', // ライム
  '#f97316', // オレンジ
  '#ec4899', // ピンク
  '#6b7280', // グレー
];