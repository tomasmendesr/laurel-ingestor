import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ActivitiesModule } from './activities/activities.module';
import { HealthModule } from './common/health/health.module';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';

@Module({
  imports: [ActivitiesModule, HealthModule],
  providers: [RequestIdMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
