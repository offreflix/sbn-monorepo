/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "finance"."categories" DROP CONSTRAINT "categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "finance"."recurrences" DROP CONSTRAINT "recurrences_user_id_fkey";

-- DropForeignKey
ALTER TABLE "finance"."transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "finance"."wallets" DROP CONSTRAINT "wallets_user_id_fkey";

-- DropTable
DROP TABLE "finance"."users";
