import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions('customers.manage')
  create(@CurrentUser() user: any, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('customers.read')
  findAll(@CurrentUser() user: any) {
    return this.customersService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('customers.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customersService.findOne(user.tenantId, id);
  }
}