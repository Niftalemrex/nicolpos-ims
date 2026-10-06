import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - startTime;

        try {
          await this.prisma.auditLog.create({
            data: {
              tenantId: user?.tenantId || null,
              userId: user?.id || null,
              action: `${method} ${url}`,
              entityType: this.getEntityType(url),
              entityId: data?.id || null,
              details: {
                method,
                url,
                ip,
                userAgent,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
                requestBody: this.sanitizeBody(request.body),
                responseStatus: 'SUCCESS',
                userEmail: user?.email || null,
              },
            },
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      }),
    );
  }

  private getEntityType(url: string): string {
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 0) return 'unknown';
    const cleanPath = parts.filter(p => p !== 'api' && p !== 'v1');
    return cleanPath[0] || 'unknown';
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.passwordHash) sanitized.passwordHash = '***';
    if (sanitized.refreshToken) sanitized.refreshToken = '***';
    if (sanitized.accessToken) sanitized.accessToken = '***';
    return sanitized;
  }
}