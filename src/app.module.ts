import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { BranchesModule } from './branches/branches.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { InvoicesModule } from './invoices/invoices.module';
import { FiscalSubmissionsModule } from './fiscal-submissions/fiscal-submissions.module';
import { SyncQueueModule } from './sync-queue/sync-queue.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CashSessionsModule } from './cash-sessions/cash-sessions.module';
import { DevicesModule } from './devices/devices.module';
import { RbacModule } from './rbac/rbac.module';
import { TaxRatesModule } from './tax-rates/tax-rates.module';
import { SalesReturnsModule } from './sales-returns/sales-returns.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { UnitsModule } from './units/units.module';
import { PriceListsModule } from './price-lists/price-lists.module';
import { StockTransfersModule } from './stock-transfers/stock-transfers.module';
import { AccountingModule } from './accounting/accounting.module';
import { SecurityEventsModule } from './security-events/security-events.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000,
          limit: 100,
        },
        {
          name: 'auth',
          ttl: 60000,
          limit: 10,
        },
        {
          name: 'sales',
          ttl: 60000,
          limit: 30,
        },
      ],
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    SalesModule,
    BranchesModule,
    WarehousesModule,
    PaymentsModule,
    ReportsModule,
    StockMovementsModule,
    InvoicesModule,
    FiscalSubmissionsModule,
    SyncQueueModule,
    AuditLogsModule,
    CategoriesModule,
    CustomersModule,
    SuppliersModule,
    CashSessionsModule,
    DevicesModule,
    RbacModule,
    TaxRatesModule,
    SalesReturnsModule,
    PurchaseOrdersModule,
    RedisModule,
    QueueModule,
    UnitsModule,
    PriceListsModule,
    StockTransfersModule,
    AccountingModule,
    SecurityEventsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}