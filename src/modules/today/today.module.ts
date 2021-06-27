import {Module} from '@nestjs/common'
import {TodayService} from './today.service'
import {TodayController} from './today.controller'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TodayModel} from './today.model'
import {TodayRepo} from './today.repo'
import {TasksModule} from '../tasks/tasks.module'

@Module({
  imports: [ObjectionModule.forFeature([TodayModel]), TasksModule],
  controllers: [TodayController],
  providers: [TodayService, TodayRepo]
})
export class TodayModule {}
