import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.ip || request.connection.remoteAddress;
    const route = request.route?.path || request.url;

    // Key: rate:user:userId:route or rate:ip:ipAddress:route
    const key = user
      ? `rate:user:${user.id}:${route}`
      : `rate:ip:${ip}:${route}`;

    const windowSeconds = 60;
    const maxRequests = this.getLimitForRoute(route);

    const current = await this.redisService.get(key);

    if (current === null) {
      await this.redisService.set(key, 1, windowSeconds);
      return true;
    }

    if (current >= maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter: windowSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.redisService.set(key, current + 1, windowSeconds);
    return true;
  }

  private getLimitForRoute(route: string): number {
    if (route.includes('/auth/login')) return 10;
    if (route.includes('/auth/register')) return 5;
    if (route.includes('/sales')) return 30;
    if (route.includes('/products')) return 60;
    if (route.includes('/reports')) return 20;
    return 100;
  }
}