/*
  Warnings:

  - Added the required column `product_name` to the `sale_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `sale_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "product_name" VARCHAR(500) NOT NULL,
ADD COLUMN     "sku" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE INDEX "sale_items_product_id_idx" ON "sale_items"("product_id");
