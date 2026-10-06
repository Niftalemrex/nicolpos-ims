import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateWarehouseDto {
  @IsUUID()
  branchId: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  type?: string;
}