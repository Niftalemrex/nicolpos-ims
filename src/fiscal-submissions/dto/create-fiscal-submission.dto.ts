import { IsUUID } from 'class-validator';

export class CreateFiscalSubmissionDto {
  @IsUUID()
  invoiceId: string;
}