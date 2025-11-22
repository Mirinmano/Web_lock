const pool = require('../config/database');

async function removeStateColumn() {
  try {
    console.log('🔄 Removing state column from locked_sites table...');

    // Check if state column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='locked_sites' AND column_name='state'
    `);

    if (checkColumn.rows.length > 0) {
      // Remove state column
      await pool.query(`
        ALTER TABLE locked_sites DROP COLUMN IF EXISTS state
      `);
      console.log('✅ State column removed from locked_sites table');
    } else {
      console.log('ℹ️  State column does not exist, skipping');
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

removeStateColumn();

