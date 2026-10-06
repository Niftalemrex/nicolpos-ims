import { IsString, IsNumber, IsOptional, Min, IsInt, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;  // Changed from category string to categoryId UUID

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;
}