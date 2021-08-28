import {Module} from '@nestjs/common'
import {ReportsService} from './reports.service'
import {ReportsController} from './reports.controller'
import {TasksModule} from '../tasks/tasks.module'

@Module({
  imports: [TasksModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
