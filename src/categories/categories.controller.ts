import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions('products.create')
  create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('products.read')
  findAll(@CurrentUser() user: any) {
    return this.categoriesService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.categoriesService.findOne(user.tenantId, id);
  }
}