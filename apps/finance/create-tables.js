const { PrismaClient } = require('@prisma/client-finance');
const prisma = new PrismaClient();

async function createTables() {
  console.log('Creating finance tables via raw SQL...');
  
  try {
    // Create wallets table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance DECIMAL(19,4) DEFAULT 0.0000,
        currency TEXT DEFAULT 'BRL',
        is_active BOOLEAN DEFAULT true,
        invoice_closing_day INTEGER,
        invoice_due_day INTEGER,
        "limit" DECIMAL(19,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);
    console.log('✓ wallets table created');

    // Create categories table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);
    console.log('✓ categories table created');

    // Create recurrences table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS recurrences (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL,
        wallet_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount DECIMAL(19,4) NOT NULL,
        currency TEXT DEFAULT 'BRL',
        description TEXT,
        type TEXT NOT NULL,
        frequency TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        last_generated TIMESTAMP,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);
    console.log('✓ recurrences table created');

    // Create transactions table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL,
        wallet_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount DECIMAL(19,4) NOT NULL,
        currency TEXT DEFAULT 'BRL',
        date TIMESTAMP NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        tags TEXT[],
        is_paid BOOLEAN DEFAULT false,
        installment_number INTEGER,
        total_installments INTEGER,
        purchase_group_id TEXT,
        recurrence_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);
    console.log('✓ transactions table created');

    // Create wishlist_items table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(19,4),
        currency TEXT DEFAULT 'BRL',
        url TEXT,
        image_url TEXT,
        priority TEXT DEFAULT 'MEDIUM',
        status TEXT DEFAULT 'WISHED',
        tags TEXT[],
        notes TEXT,
        purchased_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);
    console.log('✓ wishlist_items table created');

    console.log('\nAll tables created successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
