import {forwardRef, Module} from '@nestjs/common'
import {MyDayService} from './myday.service'
import {MyDayController} from './myday.controller'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {MyDayModel} from './myday.model'
import {MyDayRepo} from './myday.repo'
import {TasksModule} from '../tasks/tasks.module'
import {TaskSchedulerModule} from '../task-scheduler/task-scheduler.module'
import {MyDaySyncRepo} from './myday-sync.repo'

@Module({
  imports: [
    ObjectionModule.forFeature([MyDayModel]),
    forwardRef(() => TasksModule),
    forwardRef(() => TaskSchedulerModule)
  ],
  controllers: [MyDayController],
  providers: [MyDayService, MyDayRepo, MyDaySyncRepo],
  exports: [MyDayService]
})
export class MyDayModule {}
