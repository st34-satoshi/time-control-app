import { Category } from '@app-types/Category';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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

  // カテゴリを追加
  static async addCategory(userId: string, categoryData: CategoryData): Promise<string> {
    try {
      const categoryCollection = collection(db, this.collection, userId, 'categories');
      const docRef = await addDoc(categoryCollection, {
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw new Error('カテゴリの追加に失敗しました');
    }
  }

  // カテゴリを更新
  static async updateCategory(userId: string, categoryId: string, categoryData: Partial<CategoryData>): Promise<void> {
    try {
      const categoryDoc = doc(db, this.collection, userId, 'categories', categoryId);
      await updateDoc(categoryDoc, {
        ...categoryData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('カテゴリの更新に失敗しました');
    }
  }

  // カテゴリを論理削除（hiddenをtrueに設定）
  static async deleteCategory(userId: string, categoryId: string): Promise<void> {
    try {
      const categoryDoc = doc(db, this.collection, userId, 'categories', categoryId);
      await updateDoc(categoryDoc, {
        hidden: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('カテゴリの削除に失敗しました');
    }
  }
} 