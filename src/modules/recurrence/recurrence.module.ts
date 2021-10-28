import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TasksModule} from '../tasks/tasks.module'
import {RecurrenceService} from './recurrence.service'
import {RecurrenceController} from './recurrence.controller'
import {RecurrenceRepo} from './recurrence.repository'
import {RecurrenceModel} from './recurrence.model'

@Module({
  imports: [ObjectionModule.forFeature([RecurrenceModel]), TasksModule],
  controllers: [RecurrenceController],
  providers: [RecurrenceService, RecurrenceRepo]
})
export class RecurrenceModule {}
