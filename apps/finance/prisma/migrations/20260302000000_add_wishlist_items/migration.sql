-- CreateTable
CREATE TABLE "finance"."wishlist_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(19,4),
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "url" TEXT,
    "image_url" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'WISHED',
    "tags" TEXT[],
    "notes" TEXT,
    "purchased_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);
