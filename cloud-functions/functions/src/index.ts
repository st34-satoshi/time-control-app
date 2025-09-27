import {auth} from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {v4 as uuidv4} from "uuid";

initializeApp();

export const createDefaultCategories = auth.user().onCreate(async (user) => {
  console.log(`Creating defaults for user: ${user.uid}`);

  const db = getFirestore();

  try {
    // 既存のカテゴリが存在するかチェック
    const categoriesSnapshot = await db
      .collection(`timeRecords/${user.uid}/categories`)
      .limit(1)
      .get();

    if (!categoriesSnapshot.empty) {
      console.log(
        `Categories already exist for user: ${user.uid}, ` +
        "skipping default creation"
      );
      return;
    }

    // デフォルトカテゴリを作成
    const defaultCategories = [
      {value: "睡眠", label: "睡眠", icon: "😴", order: 1001},
      {value: "食事", label: "食事", icon: "🍚", order: 2002},
      {value: "お風呂", label: "お風呂", icon: "🛁", order: 2003},
      {value: "家事", label: "家事", icon: "🏠", order: 2004},
      {value: "仕事", label: "仕事", icon: "💼", order: 3001},
      {value: "勉強", label: "勉強", icon: "📚", order: 4001},
      {value: "運動", label: "運動", icon: "💪", order: 5001},
      {value: "遊び", label: "遊び", icon: "🎨", order: 6001},
      {value: "ゲーム", label: "ゲーム", icon: "🎮", order: 6002},
      {value: "その他", label: "その他", icon: "📋", order: 99001},
    ];

    await db.runTransaction(async (transaction) => {
      for (const category of defaultCategories) {
        const docRef = db.doc(
          `timeRecords/${user.uid}/categories/${uuidv4()}`
        );
        transaction.set(docRef, {
          ...category,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    console.log(`Created defaults for user: ${user.uid}`);
  } catch (error) {
    console.error(`Failed to create defaults for user: ${user.uid}`, error);
    throw error;
  }
});

