import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('products.create')
  create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('products.read')
  findAll(@CurrentUser() user: any) {
    return this.productsService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('products.update')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.remove(user.tenantId, id);
  }
}