import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { TimeRecordData, TimeRecordFormData } from '../types/TimeRecord';

export class FirestoreService {
  private static collection = 'timeRecords';

  // 時間記録を保存
  static async saveTimeRecord(data: TimeRecordFormData): Promise<string> {
    try {
      const duration = Math.floor((data.endTime.getTime() - data.startTime.getTime()) / 1000);
      
      const timeRecord: Omit<TimeRecordData, 'id'> = {
        task: data.task,
        project: data.project,
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, this.collection), {
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
  static async getTimeRecords(): Promise<TimeRecordData[]> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeRecordData[];
    } catch (error) {
      console.error('Error getting time records:', error);
      throw new Error('時間記録の取得に失敗しました');
    }
  }

  // 時間記録を削除
  static async deleteTimeRecord(id: string): Promise<void> {
    try {
      await addDoc(collection(db, this.collection), {
        id: id,
        timestamp: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error deleting time record:', error);
      throw new Error('時間記録の削除に失敗しました');
    }
  }

  // プロジェクト別の時間記録を取得
  static async getTimeRecordsByProject(project: string): Promise<TimeRecordData[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('project', '==', project),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeRecordData[];
    } catch (error) {
      console.error('Error getting time records by project:', error);
      throw new Error('プロジェクト別の時間記録の取得に失敗しました');
    }
  }
} 