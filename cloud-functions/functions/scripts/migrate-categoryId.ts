// scripts/migrate-categoryId.ts
// categoryのvalueからidを取得して、recordsのcategoryIdに設定する
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Firebase Admin SDKを初期化
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

interface MigrationStats {
  totalUsers: number;
  totalRecords: number;
  updatedRecords: number;
  skippedRecords: number;
  missingCategories: number;
  duplicateCategories: number;
}

async function migrateCategoryId(): Promise<MigrationStats> {
  console.log('🚀 Starting categoryId migration...');
  
  const userRefs = await db.collection('timeRecords').listDocuments();
  console.log(`Found ${userRefs.length} users`);

  const stats: MigrationStats = {
    totalUsers: userRefs.length,
    totalRecords: 0,
    updatedRecords: 0,
    skippedRecords: 0,
    missingCategories: 0,
    duplicateCategories: 0,
  };

  const writer = db.bulkWriter();
  writer.onWriteError((err: any) => {
    console.error('❌ Write error:', err.documentRef.path, err.message);
    // リトライ可能なら再試行
    return err.failedAttempts < 3;
  });

  for (const userRef of userRefs) {
    const userId = userRef.id;
    console.log(`\n📁 Processing user: ${userId}`);

    // 1) Categoryの value -> id マップを作成
    const catSnap = await userRef.collection('categories').get();
    const valueToId = new Map<string, string>();
    const dupValues = new Set<string>();

    catSnap.forEach((doc) => {
      const d = doc.data() as { value?: string };
      const v = (d.value ?? '').trim();
      if (!v) return;
      if (valueToId.has(v)) {
        dupValues.add(v);
        stats.duplicateCategories++;
      } else {
        valueToId.set(v, doc.id);
      }
    });

    if (dupValues.size > 0) {
      console.warn(`⚠️  Duplicate category values detected for user=${userId}:`, [...dupValues]);
    }

    // 2) records を走査して、categoryId が無い／空のものだけ更新
    const recSnap = await userRef.collection('records').get();
    let userUpdated = 0, userSkipped = 0, userMissing = 0;

    recSnap.forEach((doc) => {
      const rec = doc.data() as { category?: string; categoryId?: string | null };
      stats.totalRecords++;

      // すでに categoryId が入っているならスキップ
      if (rec.categoryId) { 
        userSkipped++; 
        stats.skippedRecords++;
        return; 
      }

      const key = typeof rec.category === 'string' ? rec.category.trim() : '';
      if (!key) { 
        userMissing++; 
        stats.missingCategories++;
        return; 
      }

      // value -> id マップで検索（重複の value はスキップ）
      if (dupValues.has(key)) {
        console.warn(`⚠️  duplicate category "${key}" at ${doc.ref.path}`);
      }

      const catId = valueToId.get(key);
      if (!catId) {
        console.warn(`❌ No category match for "${key}" at ${doc.ref.path}`);
        userMissing++;
        stats.missingCategories++;
        return;
      }

      writer.update(doc.ref, {
        categoryId: catId,
        updatedAt: FieldValue.serverTimestamp(),
      });
      userUpdated++;
      stats.updatedRecords++;
    });

    console.log(`✅ User ${userId}: updated=${userUpdated}, skipped=${userSkipped}, missing=${userMissing}`);
  }

  await writer.close();
  return stats;
}

async function main() {
  const startTime = Date.now();
  
  try {
    const stats = await migrateCategoryId();
    const duration = Date.now() - startTime;
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Statistics:');
    console.log(`   Total users: ${stats.totalUsers}`);
    console.log(`   Total records: ${stats.totalRecords}`);
    console.log(`   Updated records: ${stats.updatedRecords}`);
    console.log(`   Skipped records: ${stats.skippedRecords}`);
    console.log(`   Missing categories: ${stats.missingCategories}`);
    console.log(`   Duplicate categories: ${stats.duplicateCategories}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
