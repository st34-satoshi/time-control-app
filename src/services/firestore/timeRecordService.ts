import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@root/firebase';
import { TimeRecordDataForSave, TimeRecordFormData, TimeRecordDataForGet } from '../../types/TimeRecord';

export class timeRecordService {
  private static collection = 'timeRecords';

  // 時間記録を保存
  static async saveTimeRecord(data: TimeRecordFormData, userId: string): Promise<string> {
    try {
      const duration = Math.floor((data.endTime.getTime() - data.startTime.getTime()) / 1000);
      
      const timeRecord: Omit<TimeRecordDataForSave, 'id'> = {
        task: data.task,
        category: data.category,

        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userCollection = collection(db, this.collection, userId, 'records');
      const docRef = await addDoc(userCollection, {
        ...timeRecord,
        timestamp: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving time record:', error);
      throw new Error('時間記録の保存に失敗しました');
    }
  }

  // 時間記録を取得
  static async getTimeRecords(userId: string): Promise<TimeRecordDataForGet[]> {
    try {
      const userCollection = collection(db, this.collection, userId, 'records');
      const q = query(
        userCollection,
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeRecordDataForGet[];
    } catch (error) {
      console.error('Error getting time records:', error);
      throw new Error('時間記録の取得に失敗しました');
    }
  }

  // 時間記録を削除
  static async deleteTimeRecord(id: string, userId: string): Promise<void> {
    try {
      const userCollection = collection(db, this.collection, userId, 'records');
      const docRef = doc(userCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting time record:', error);
      throw new Error('時間記録の削除に失敗しました');
    }
  }

} 