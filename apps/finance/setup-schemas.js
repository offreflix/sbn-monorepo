const { PrismaClient } = require('@prisma/client-finance');
const prisma = new PrismaClient();

async function setup() {
  console.log('Creating PostgreSQL schemas...');
  
  try {
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS auth`);
    console.log('✓ Schema "auth" created');
    
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS finance`);
    console.log('✓ Schema "finance" created');
    
    console.log('\nSchemas ready!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
