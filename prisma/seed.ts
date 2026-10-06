import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ================================
  // PERMISSIONS
  // ================================
  const permissions = [
    { name: 'View Products', code: 'products.read', module: 'products', description: 'View product information' },
    { name: 'Create Products', code: 'products.create', module: 'products', description: 'Create new products' },
    { name: 'Update Products', code: 'products.update', module: 'products', description: 'Update product information' },
    { name: 'Delete Products', code: 'products.delete', module: 'products', description: 'Delete products' },
    { name: 'View Sales', code: 'sales.read', module: 'sales', description: 'View sales information' },
    { name: 'Create Sales', code: 'sales.create', module: 'sales', description: 'Create new sales' },
    { name: 'Refund Sales', code: 'sales.refund', module: 'sales', description: 'Process refunds' },
    { name: 'View Inventory', code: 'inventory.read', module: 'inventory', description: 'View inventory levels' },
    { name: 'Adjust Inventory', code: 'inventory.adjust', module: 'inventory', description: 'Adjust stock levels' },
    { name: 'View Reports', code: 'reports.view', module: 'reports', description: 'Access reports' },
    { name: 'Manage Users', code: 'users.manage', module: 'users', description: 'Manage users and roles' },
    { name: 'View Invoices', code: 'invoices.view', module: 'invoices', description: 'View fiscal invoices' },
    { name: 'Cancel Invoices', code: 'invoices.cancel', module: 'invoices', description: 'Cancel invoices' },
    { name: 'View Branches', code: 'branches.read', module: 'branches', description: 'View branches' },
    { name: 'Manage Branches', code: 'branches.manage', module: 'branches', description: 'Manage branches' },
    { name: 'View Customers', code: 'customers.read', module: 'customers', description: 'View customers' },
    { name: 'Manage Customers', code: 'customers.manage', module: 'customers', description: 'Manage customers' },
    { name: 'View Suppliers', code: 'suppliers.read', module: 'suppliers', description: 'View suppliers' },
    { name: 'Manage Suppliers', code: 'suppliers.manage', module: 'suppliers', description: 'Manage suppliers' },
    { name: 'Manage Tax Rates', code: 'tax.manage', module: 'tax', description: 'Manage tax rates' },
    { name: 'Process Returns', code: 'returns.process', module: 'returns', description: 'Process sales returns' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  console.log('✅ Permissions seeded');

  // ================================
  // ROLES (System-level, no tenant)
  // ================================
  const tenantAdminRole = await prisma.role.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'TENANT_ADMIN',
      description: 'Full access to tenant',
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'CASHIER',
      description: 'Can process sales',
    },
  });
  console.log('✅ Roles seeded');

  // ================================
  // ASSIGN ALL PERMISSIONS TO TENANT_ADMIN
  // ================================
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: tenantAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: tenantAdminRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log('✅ TENANT_ADMIN permissions assigned');

  // ================================
  // ASSIGN CASHIER PERMISSIONS
  // ================================
  const cashierPermissionCodes = ['sales.read', 'sales.create', 'products.read', 'customers.read'];
  for (const code of cashierPermissionCodes) {
    const perm = await prisma.permission.findUnique({ where: { code } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: cashierRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: cashierRole.id,
          permissionId: perm.id,
        },
      });
    }
  }
  console.log('✅ CASHIER permissions assigned');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });