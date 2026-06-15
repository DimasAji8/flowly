import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
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
