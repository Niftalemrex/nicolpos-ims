import { IsString, IsUUID, IsObject, IsOptional } from 'class-validator';

export class CreateSyncItemDto {
  @IsString()
  deviceId: string;

  @IsString()
  entityType: string;

  @IsUUID()
  entityId: string;

  @IsString()
  operation: string; // CREATE, UPDATE, DELETE

  @IsObject()
  payload: any;
}