import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @RequirePermissions('branches.manage')
  create(@CurrentUser() user: any, @Body() dto: CreateBranchDto) {
    return this.branchesService.create(user.tenantId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @RequirePermissions('branches.read')
  findAll(@CurrentUser() user: any) {
    return this.branchesService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('branches.read')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.branchesService.findOne(user.tenantId, id);
  }
}