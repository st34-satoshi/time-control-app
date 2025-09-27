
// scripts/migrate-category-color.ts
// 全てのtimeRecords/{userId}/categories/{id}にcolorをPRESET_COLORSから順番に設定する
import {initializeApp, applicationDefault} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

// Firebase Admin SDKを初期化
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

export const PRESET_COLORS = [
  '#3b82f6', // 青
  '#ef4444', // 赤
  '#10b981', // 緑
  '#f59e0b', // オレンジ
  '#8b5cf6', // 紫
  '#06b6d4', // シアン
  '#84cc16', // ライム
  '#f97316', // オレンジ
  '#ec4899', // ピンク
  '#6b7280', // グレー
];

interface MigrationStats {
  totalUsers: number;
  totalCategories: number;
  updatedCategories: number;
  skippedCategories: number;
  errors: number;
}

/**
 * Migrates category colors using PRESET_COLORS sequentially
 * @return {Promise<MigrationStats>} Migration statistics
 */
async function migrateCategoryColors(): Promise<MigrationStats> {
  console.log("🚀 Starting category color migration...");

  const userRefs = await db.collection("timeRecords").listDocuments();
  console.log(`Found ${userRefs.length} users`);

  const stats: MigrationStats = {
    totalUsers: userRefs.length,
    totalCategories: 0,
    updatedCategories: 0,
    skippedCategories: 0,
    errors: 0,
  };

  const writer = db.bulkWriter();
  writer.onWriteError((err: Error & {
    documentRef: { path: string };
    failedAttempts: number;
  }) => {
    console.error("❌ Write error:", err.documentRef.path, err.message);
    stats.errors++;
    // リトライ可能なら再試行
    return err.failedAttempts < 3;
  });

  for (const userRef of userRefs) {
    const userId = userRef.id;
    console.log(`\n📁 Processing user: ${userId}`);

    try {
      // カテゴリを取得（order順でソート）
      const categoriesSnapshot = await userRef
        .collection("categories")
        .orderBy("order", "asc")
        .get();

      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        data: doc.data()
      }));

      console.log(`Found ${categories.length} categories for user ${userId}`);

      let colorIndex = 0;
      let userUpdated = 0;
      let userSkipped = 0;

      for (const category of categories) {
        stats.totalCategories++;

        // すでにcolorが設定されている場合はスキップ
        if (category.data.color) {
          userSkipped++;
          stats.skippedCategories++;
          console.log(`⏭️  Skipping category ${category.id} (already has color: ${category.data.color})`);
          continue;
        }

        // PRESET_COLORSから順番に色を割り当て
        const color = PRESET_COLORS[colorIndex % PRESET_COLORS.length];
        
        writer.update(category.ref, {
          color: color,
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`🎨 Setting color ${color} for category ${category.id} (${category.data.label || category.data.value})`);
        
        userUpdated++;
        stats.updatedCategories++;
        colorIndex++;
      }

      console.log(
        `✅ User ${userId}: updated=${userUpdated}, ` +
        `skipped=${userSkipped}`
      );

    } catch (error) {
      console.error(`❌ Error processing user ${userId}:`, error);
      stats.errors++;
    }
  }

  await writer.close();
  return stats;
}

/**
 * Main function to run the migration
 */
async function main() {
  const startTime = Date.now();

  try {
    const stats = await migrateCategoryColors();
    const duration = Date.now() - startTime;

    console.log("\n🎉 Migration completed successfully!");
    console.log("📊 Statistics:");
    console.log(`   Total users: ${stats.totalUsers}`);
    console.log(`   Total categories: ${stats.totalCategories}`);
    console.log(`   Updated categories: ${stats.updatedCategories}`);
    console.log(`   Skipped categories: ${stats.skippedCategories}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});