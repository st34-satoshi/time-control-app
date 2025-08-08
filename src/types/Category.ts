export interface Category {
  value: string;
  label: string;
  icon: string;
}

export class CategoryManager {
  private static categories: Category[] = [
    { value: 'アプリ開発', label: '📱 アプリ開発', icon: '📱' },
    { value: '勉強', label: '📚 勉強', icon: '📚' },
    { value: '運動', label: '💪 運動', icon: '💪' },
    { value: 'デザイン', label: '🎨 デザイン', icon: '🎨' },
    { value: '会議', label: '👥 会議', icon: '👥' },
    { value: 'その他', label: '📋 その他', icon: '📋' },
  ];

  // 全カテゴリを取得
  static getAllCategories(): Category[] {
    return this.categories;
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
} 