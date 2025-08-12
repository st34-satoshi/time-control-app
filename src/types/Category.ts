import { CategoryService } from '@services/firestore/categoryService';
export interface Category {
  id?: string;
  value: string;
  label: string;
  icon: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export class CategoryManager {
  private static categories: Category[] = [
    { value: 'アプリ開発', label: '📱 アプリ開発', icon: '📱', order: 1 },
    { value: '勉強', label: '📚 勉強', icon: '📚', order: 2 },
    // { value: '運動', label: '💪 運動', icon: '💪', order: 3 },
    { value: 'デザイン', label: '🎨 デザイン', icon: '🎨', order: 4 },
    { value: '会議', label: '👥 会議', icon: '👥', order: 5 },
    { value: 'その他', label: '📋 その他', icon: '📋', order: 6 },
  ];

  // 全カテゴリを取得
  static async getAllCategories(userId: string): Promise<Category[]> {
    const categories = await CategoryService.getCategories(userId);
    return categories;
  }

  // valueからアイコンを取得
  static getIconByValue(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category?.icon || '📋'; // デフォルトアイコン
  }

  // valueからカテゴリ全体を取得
  static getCategoryByValue(value: string): Category | undefined {
    return this.categories.find(cat => cat.value === value);
  }

  // カテゴリの存在確認
  static isValidCategory(value: string): boolean {
    return this.categories.some(cat => cat.value === value);
  }

  // カテゴリをソート（order順）
  static sortCategoriesByOrder(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }
} 