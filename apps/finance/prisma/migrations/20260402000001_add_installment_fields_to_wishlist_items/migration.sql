-- AlterTable
ALTER TABLE "finance"."wishlist_items"
ADD COLUMN "installment_count" INTEGER,
ADD COLUMN "installment_value" DECIMAL(19,4);
