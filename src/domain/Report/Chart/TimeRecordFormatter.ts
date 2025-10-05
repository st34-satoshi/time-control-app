import { TimeRecordDataForGet, TimeSlot } from '@root/src/types/TimeRecord';
import { CategoryManager } from '@domain/Category';
import { PRESET_COLORS } from '@app-types/Category';

// TimeRecordを受け取ってstartDateからendDateまでのTimeSlotを作成する関数
export const FormatTimeRecords = (timeRecords: TimeRecordDataForGet[], categoryManager: CategoryManager, startDate: Date, endDate: Date): TimeSlot[] => {
  // 時間順にソート
  const sortedRecords = [...timeRecords].sort((a, b) => a.startTime.seconds - b.startTime.seconds);
  
  const formattedRecords: TimeSlot[] = [];
  const sDay = new Date(startDate.setHours(0, 0, 0, 0));
  const eDay = new Date(endDate.setHours(23, 59, 59, 999));
  let lastTime = sDay;
  for (let i = 0; i < sortedRecords.length; i++) {
    const record = sortedRecords[i];
    let startTime = new Date(record.startTime.seconds * 1000);
    let endTime = new Date(record.endTime.seconds * 1000);
    if (startTime > eDay || endTime < sDay) {
      continue;
    }
    if (endTime > eDay) {
      endTime = eDay;
    }
    if (endTime < lastTime) {
      continue;
    }
    if (startTime < lastTime) {
      startTime = lastTime;
    }
  
    const category = categoryManager.getAllCategories().find(cat => cat.id === record.categoryId) || { id: '', value: 'Unknown', label: 'Unknown', icon: '📋', color: '#3b82f6' };
    formattedRecords.push({
      category,
      categoryColor: category.color || PRESET_COLORS[i % PRESET_COLORS.length],
      startTime,
      endTime,
      task: record.task,
      durationMinutes: (endTime.getTime() - startTime.getTime()) / 1000 / 60
    });
    lastTime = endTime;
  }
  return formattedRecords;
};