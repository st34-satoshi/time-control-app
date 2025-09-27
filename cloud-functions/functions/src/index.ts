import {auth} from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {v4 as uuidv4} from "uuid";

initializeApp();

export const createDefaultCategories = auth.user()
  .onCreate(async (user) => {
    console.log(`27 Creating defaults for user start: ${user.uid}`);

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
      } else {
        console.log(
          `Categories do not exist for user: ${user.uid}, ` +
        "creating defaults"
        );
      }

      // デフォルトカテゴリを作成
      const defaultCategories = [
        {value: "睡眠", label: "睡眠", icon: "😴", order: 1001, color: "#10b981"},
        {value: "食事", label: "食事", icon: "🍚", order: 2002, color: "#f59e0b"},
        {value: "お風呂", label: "お風呂", icon: "🛁", order: 2003, color: "#84cc16"},
        {value: "家事", label: "家事", icon: "🏠", order: 2004, color: "#8b5cf6"},
        {value: "仕事", label: "仕事", icon: "💼", order: 3001, color: "#06b6d4"},
        {value: "勉強", label: "勉強", icon: "📚", order: 4001, color: "#84cc16"},
        {value: "運動", label: "運動", icon: "💪", order: 5001, color: "#f97316"},
        {value: "遊び", label: "遊び", icon: "🎨", order: 6001, color: "#ec4899"},
        {value: "ゲーム", label: "ゲーム", icon: "🎮", order: 6002, color: "#3b82f6"},
        {value: "その他", label: "その他", icon: "📋", order: 99001, color: "#6b7280"},
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

