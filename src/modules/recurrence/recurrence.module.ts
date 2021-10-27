import {Module} from '@nestjs/common'
import {RecurrenceService} from './recurrence.service'
import {RecurrenceController} from './recurrence.controller'
import {RecurrenceRepo} from './recurrence.repository'

@Module({
  controllers: [RecurrenceController],
  providers: [RecurrenceService, RecurrenceRepo]
})
export class RecurrenceModule {}
