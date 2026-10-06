import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(private prisma: PrismaService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception.stack,
    );

    // Log failed requests to audit log
    try {
      const user = request.user;
      await this.prisma.auditLog.create({
        data: {
          tenantId: user?.tenantId || null,
          userId: user?.id || null,
          action: `${request.method} ${request.url}`,
          entityType: 'error',
          entityId: null,
          details: {
            method: request.method,
            url: request.url,
            ip: request.ip || 'unknown',
            userAgent: request.headers['user-agent'] || 'unknown',
            status,
            message: typeof message === 'string' ? message : JSON.stringify(message),
            timestamp: new Date().toISOString(),
            responseStatus: 'FAILED',
          },
        },
      });
    } catch (auditError) {
      console.error('Failed to create error audit log:', auditError);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}