import { Category } from '@app-types/Category';
import { CategoryService, CategoryData } from '@services/firestore/categoryService';
import { Alert } from 'react-native';

export class CategoryManager {
  private categories: Category[] = [];
  private userId: string;

  private constructor(userId: string) {
    this.userId = userId;
  }

  // ファクトリーメソッド（非同期初期化）
  static async create(userId: string): Promise<CategoryManager> {
    const manager = new CategoryManager(userId);
    await manager.initializeCategories();
    return manager;
  }

  // カテゴリを初期化
  private async initializeCategories(): Promise<void> {
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 1000; // 1 second

    while (retryCount < maxRetries) {
      this.categories = await CategoryService.getCategories(this.userId);
      
      if (this.categories.length > 0) {
        return;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    Alert.alert('カテゴリの取得に失敗しました。カテゴリが見つかりませんでした。');
  }

  // 全カテゴリを取得
  getAllCategories(): Category[] {
    return this.categories;
  }

  // valueからアイコンを取得（同期的に実行）
  getIconByValue(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category?.icon || '📋'; // デフォルトアイコン
  }

  // カテゴリを追加
  async addCategory(categoryData: CategoryData): Promise<void> {
    try {
      const newOrder = Math.max(...this.categories.map(c => c.order || 0), 0) + 1;
      const categoryWithOrder = { ...categoryData, order: newOrder };
      
      const categoryId = await CategoryService.addCategory(this.userId, categoryWithOrder);
      
      // ローカルキャッシュを更新
      this.categories.push({
        id: categoryId,
        ...categoryWithOrder,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // カテゴリを更新
  async updateCategory(categoryId: string, categoryData: Partial<CategoryData>): Promise<void> {
    try {
      await CategoryService.updateCategory(this.userId, categoryId, categoryData);
      
      // ローカルキャッシュを更新
      const index = this.categories.findIndex(cat => cat.id === categoryId);
      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          ...categoryData,
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // カテゴリを削除
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await CategoryService.deleteCategory(this.userId, categoryId);
      
      // ローカルキャッシュを更新
      this.categories = this.categories.filter(cat => cat.id !== categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // カテゴリを再読み込み
  async reloadCategories(): Promise<void> {
    this.categories = await CategoryService.getCategories(this.userId);
  }
}
