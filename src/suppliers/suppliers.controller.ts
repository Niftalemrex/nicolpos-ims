import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions('suppliers.manage')
  create(@CurrentUser() user: any, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('suppliers.read')
  findAll(@CurrentUser() user: any) {
    return this.suppliersService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('suppliers.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.suppliersService.findOne(user.tenantId, id);
  }
}