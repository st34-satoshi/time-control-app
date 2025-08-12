import { Category } from '@app-types/Category';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@root/firebase';

export interface CategoryData {
  value: string;
  label: string;
  icon: string;
  order?: number;
}

export class CategoryService {
  private static collection = 'timeRecords';

  // カテゴリを取得
  static async getCategories(userId: string): Promise<Category[]> {
    try {
      const categoryCollection = collection(db, this.collection, userId, 'categories');
      const q = query(
        categoryCollection,
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('カテゴリの取得に失敗しました');
    }
  }
} 