import { Category } from '@app-types/Category';
import { CategoryService } from '@services/firestore/categoryService';

export class CategoryManager {
  private static categories: Category[] = [
    { value: 'アプリ開発', label: '📱 アプリ開発', icon: '📱', order: 1 },
    { value: '勉強', label: '📚 勉強', icon: '📚', order: 2 },
    // { value: '運動', label: '💪 運動', icon: '💪', order: 3 },
    { value: 'デザイン', label: '🎨 デザイン', icon: '🎨', order: 4 },
    { value: '会議', label: '👥 会議', icon: '👥', order: 5 },
    { value: 'その他', label: '📋 その他', icon: '📋', order: 6 },
  ];

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
