import {Module} from '@nestjs/common'
import {TasksModule} from 'src/modules/tasks/tasks.module'
import {ReportsService} from './reports.service'
import {ReportsController} from './reports.controller'

@Module({
  imports: [TasksModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
