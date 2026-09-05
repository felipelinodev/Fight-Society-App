import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { validate } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { CheckInsModule } from './modules/checkins/checkins.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PlansModule,
    EnrollmentsModule,
    PaymentsModule,
    SchedulesModule,
    CheckInsModule,
  ],
  providers: [
    // Global JWT auth guard (all routes protected by default)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global response transform
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
