import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RecurringModule } from '../modules/recurring/recurring.module';
import { RecurringJob } from './recurring.job';

@Module({
  imports: [ScheduleModule.forRoot(), RecurringModule],
  providers: [RecurringJob],
})
export class JobsModule {}
