-- CreateTable
CREATE TABLE "finance"."wishlist_priority_entries" (
    "id" TEXT NOT NULL,
    "wishlist_item_id" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_priority_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "finance"."wishlist_priority_entries" ADD CONSTRAINT "wishlist_priority_entries_wishlist_item_id_fkey" FOREIGN KEY ("wishlist_item_id") REFERENCES "finance"."wishlist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
