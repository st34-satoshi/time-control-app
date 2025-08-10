import { auth } from "firebase-functions/v1";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

export const createUserDefaults = auth.user().onCreate(async (user) => {
  console.log(`Creating defaults for user: ${user.uid}`);
  // デフォルトカテゴリを作成
  const defaultCategories = [
    { value: '睡眠', label: '睡眠', icon: '😴', order: 1001 },
    { value: '生活', label: '生活', icon: '🏠', order: 2001 },
    { value: '生活|食事', label: '生活|食事', icon: '🏠', order: 2002 },
    { value: '生活|お風呂', label: '生活|お風呂', icon: '🏠', order: 2003 },
    { value: '生活|家事', label: '生活|家事', icon: '🏠', order: 2004 },
    { value: '仕事', label: '仕事', icon: '💼', order: 3001 },
    { value: '仕事|通勤', label: '仕事|通勤', icon: '💼', order: 3002 },
    { value: '勉強', label: '勉強', icon: '📚', order: 4001 },
    { value: '勉強|通学', label: '勉強|通学', icon: '📚', order: 4002 },
    { value: '勉強|学校', label: '勉強|学校', icon: '📚', order: 4003 },
    { value: '勉強|塾', label: '勉強|塾', icon: '📚', order: 4004 },
    { value: '運動', label: '運動', icon: '💪', order: 5001 },
    { value: '運動|ジム', label: '運動|ジム', icon: '💪', order: 5002 },
    { value: '運動|ウォーキング', label: '運動|ウォーキング', icon: '💪', order: 5003 },
    { value: '運動|ストレッチ', label: '運動|ストレッチ', icon: '💪', order: 5004 },
    { value: '運動|スポーツ', label: '運動|スポーツ', icon: '💪', order: 5005 },
    { value: '遊び', label: '遊び', icon: '🎨', order: 6001 },
    { value: '遊び|友達', label: '遊び|友達', icon: '🎨', order: 6002 },
    { value: '遊び|読書', label: '遊び|読書', icon: '🎨', order: 6003 },
    { value: '遊び|音楽', label: '遊び|音楽', icon: '🎨', order: 6004 },
    { value: '遊び|映画', label: '遊び|映画', icon: '🎨', order: 6005 },
    { value: '遊び|ゲーム', label: '遊び|ゲーム', icon: '🎨', order: 6006 },
    { value: '遊び|SNS', label: '遊び|SNS', icon: '🎨', order: 6007 },
    { value: 'その他', label: 'その他', icon: '📋', order: 99001 },
  ];

  const db = getFirestore();
  for (const category of defaultCategories) {
    await db.doc(`timeRecords/${user.uid}/categories/${category.value}`).set({
      ...category,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(`Created defaults for user: ${user.uid}`);
});

