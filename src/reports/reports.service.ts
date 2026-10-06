import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailySalesReport(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: today,
        },
        status: 'COMPLETED',
      },
      include: {
        saleItems: true,
        payments: true,
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.taxAmount), 0);
    const totalItems = sales.reduce((sum, sale) => 
      sum + sale.saleItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    return {
      date: today.toISOString().split('T')[0],
      totalSales,
      totalRevenue,
      totalTax,
      totalItems,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    };
  }

  async getInventoryReport(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { quantity: 'asc' },
    });

    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = products.reduce((sum, product) => 
      sum + (Number(product.sellingPrice) * product.quantity), 0);
    const lowStock = products.filter(p => p.quantity <= 10);

    return {
      totalProducts,
      totalQuantity,
      totalValue,
      lowStockItems: lowStock.length,
      products: products.slice(0, 10),
    };
  }

  async getSalesByBranch(tenantId: string) {
    const salesByBranch = await this.prisma.sale.groupBy({
      by: ['branchId'],
      where: { tenantId },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    return salesByBranch;
  }

  async getSalesReport(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date('2026-09-01');
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'COMPLETED',
      },
      include: {
        saleItems: true,
        payments: true,
        cashier: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.taxAmount), 0);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalSales,
      totalRevenue,
      totalTax,
      sales,
    };
  }
}