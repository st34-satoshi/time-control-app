import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecordingState {
  isRecording: boolean;
  startTime: string; // ISO string
  task: string;
  categoryId: string;
}

const RECORDING_STATE_KEY = 'current_recording_state';

export class RecordingController {
  // レコーディング状態を保存
  static async saveRecordingState(state: RecordingState): Promise<void> {
    try {
      await AsyncStorage.setItem(RECORDING_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving recording state:', error);
    }
  }

  // レコーディング状態を取得
  static async getRecordingState(): Promise<RecordingState | null> {
    try {
      const stateString = await AsyncStorage.getItem(RECORDING_STATE_KEY);
      if (stateString) {
        return JSON.parse(stateString);
      }
      return null;
    } catch (error) {
      console.error('Error getting recording state:', error);
      return null;
    }
  }

  // レコーディング状態をクリア
  static async clearRecordingState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECORDING_STATE_KEY);
    } catch (error) {
      console.error('Error clearing recording state:', error);
    }
  }

  // 経過時間を計算（現在時刻 - 開始時刻）
  static calculateElapsedTime(startTime: string): number {
    const start = new Date(startTime);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  }
}
