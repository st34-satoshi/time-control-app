import { Category } from '@app-types/Category';
import { CategoryService } from '@services/firestore/categoryService';

export class CategoryManager {
  // 全カテゴリを取得
  static async getAllCategories(userId: string): Promise<Category[]> {
    return await CategoryService.getCategories(userId);
  }

  // valueからアイコンを取得
  static async getIconByValue(value: string, userId: string): Promise<string> {
    const categories = await this.getAllCategories(userId);
    const category = categories.find(cat => cat.value === value);
    return category?.icon || '📋'; // デフォルトアイコン
  }
}
