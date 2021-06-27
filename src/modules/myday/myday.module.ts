import {forwardRef, Module} from '@nestjs/common'
import {MyDayService} from './myday.service'
import {MyDayController} from './myday.controller'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {MyDayModel} from './myday.model'
import {MyDayRepo} from './myday.repo'
import {TasksModule} from '../tasks/tasks.module'

@Module({
  imports: [
    ObjectionModule.forFeature([MyDayModel]),
    forwardRef(() => TasksModule)
  ],
  controllers: [MyDayController],
  providers: [MyDayService, MyDayRepo]
})
export class MyDayModule {}
