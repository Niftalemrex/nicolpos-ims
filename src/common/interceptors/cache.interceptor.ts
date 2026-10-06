import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `cache:${request.method}:${request.url}`;

    if (request.method !== 'GET') {
      return next.handle();
    }

    let ttl = 60;
    if (request.url.includes('/products')) ttl = 300;
    if (request.url.includes('/categories')) ttl = 600;
    if (request.url.includes('/tax-rates')) ttl = 1800;
    if (request.url.includes('/branches')) ttl = 300;
    if (request.url.includes('/warehouses')) ttl = 300;
    if (request.url.includes('/customers')) ttl = 300;
    if (request.url.includes('/suppliers')) ttl = 300;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.redisService.set(cacheKey, data, ttl);
        console.log(`🔄 Cached: ${cacheKey} (${ttl}s)`);
      }),
    );
  }
}