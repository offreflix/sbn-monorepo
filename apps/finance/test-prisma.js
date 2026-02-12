const { PrismaClient } = require('@prisma/client-finance');

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing Prisma connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✓ Database connection OK:', result);
    
    console.log('\nTesting Wallet model...');
    const wallets = await prisma.wallet.findMany({ take: 5 });
    console.log(`✓ Found ${wallets.length} wallets`);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

test();
