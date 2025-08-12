import { Category } from '@app-types/Category';
import { CategoryService } from '@services/firestore/categoryService';

export class CategoryManager {
  // キャッシュ用のプロパティ
  private static categoryCache: Map<string, { categories: Category[]; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

  // 全カテゴリを取得（キャッシュ対応）
  static async getAllCategories(userId: string): Promise<Category[]> {
    // キャッシュから取得を試行
    const cached = this.getCachedCategories(userId);
    if (cached) {
      return cached;
    }

    // キャッシュにない場合はFirestoreから取得
    const categories = await CategoryService.getCategories(userId);
    
    // 取得したカテゴリをキャッシュに保存
    this.cacheCategories(userId, categories);
    
    return categories;
  }

  // キャッシュからカテゴリを取得
  private static getCachedCategories(userId: string): Category[] | null {
    const cached = this.categoryCache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      // キャッシュが期限切れの場合は削除
      this.categoryCache.delete(userId);
      return null;
    }

    return cached.categories;
  }

  // カテゴリをキャッシュに保存
  private static cacheCategories(userId: string, categories: Category[]): void {
    this.categoryCache.set(userId, {
      categories,
      timestamp: Date.now()
    });
  }

  // キャッシュをクリア
  static clearCache(userId?: string): void {
    if (userId) {
      this.categoryCache.delete(userId);
    } else {
      this.categoryCache.clear();
    }
  }

  // 特定ユーザーのキャッシュを更新
  static refreshCache(userId: string): void {
    this.categoryCache.delete(userId);
  }

  // valueからアイコンを取得
  static async getIconByValue(value: string, userId: string): Promise<string> {
    const categories = await this.getAllCategories(userId);
    const category = categories.find(cat => cat.value === value);
    return category?.icon || '📋'; // デフォルトアイコン
  }
}
