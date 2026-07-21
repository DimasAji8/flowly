import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { B2bAuthGuard } from './modules/auth/guards/b2b-auth.guard';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SavingsGoalsModule } from './modules/savings-goals/savings-goals.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RecurringModule } from './modules/recurring/recurring.module';
import { JobsModule } from './jobs/jobs.module';

import { TransfersModule } from './modules/transfers/transfers.module';
import { DeveloperModule } from './modules/developer/developer.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AiModule } from './modules/ai/ai.module';
import { BudgetsModule } from './modules/budgets/budgets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        // Config default global — endpoint AI override lewat @Throttle()
        ttl: 60_000, // 1 menit (dalam ms)
        limit: 100,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    WalletsModule,
    CategoriesModule,
    SavingsGoalsModule,
    TransactionsModule,
    RecurringModule,
    JobsModule,
    TransfersModule,
    DeveloperModule,
    ReviewsModule,
    AiModule,
    BudgetsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: B2bAuthGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly appService: AppService) {}

  async onModuleInit() {
    // Seed akun developer dari env variable
    try {
      await this.appService.seedDeveloper();
    } catch (error) {
      this.logger.error('Gagal seed developer account', error);
    }
  }
}
