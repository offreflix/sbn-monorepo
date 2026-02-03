const { PrismaClient } = require('@prisma/client-finance');
const prisma = new PrismaClient();

prisma.$queryRaw`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name
`.then(tables => {
  console.log('Tables in database:');
  tables.forEach(t => console.log('  -', t.table_name));
}).catch(err => {
  console.error('Error:', err.message);
}).finally(() => prisma.$disconnect());
