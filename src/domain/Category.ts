import { Category } from '@app-types/Category';
import { CategoryService } from '@services/firestore/categoryService';
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
}
