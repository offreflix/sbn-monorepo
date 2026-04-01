-- AlterTable
ALTER TABLE "finance"."wishlist_price_entries"
ADD COLUMN "cash_price" DECIMAL(19,4),
ADD COLUMN "installment_count" INTEGER,
ADD COLUMN "installment_value" DECIMAL(19,4);
