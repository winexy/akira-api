import {Module} from '@nestjs/common'
import {ReportsService} from './reports.service'
import {ReportsController} from './reports.controller'
import {TaskSchedulerModule} from '../task-scheduler/task-scheduler.module'

@Module({
  imports: [TaskSchedulerModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
