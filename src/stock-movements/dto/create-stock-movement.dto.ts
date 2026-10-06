import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateStockMovementDto {
  @IsUUID()
  warehouseId: string;

  @IsUUID()
  productId: string;

  @IsString()
  movementType: string; // SALE, PURCHASE, ADJUSTMENT, etc.

  @IsNumber()
  quantity: number; // Positive for IN, negative for OUT

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;
}