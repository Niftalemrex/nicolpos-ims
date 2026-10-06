import { IsNumber, IsUUID, Min, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID()
  saleId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  @Min(0)
  amount: number;
}