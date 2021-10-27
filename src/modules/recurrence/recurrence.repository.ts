import {Inject, Injectable} from '@nestjs/common'
import {RecurrenceModel} from './recurrence.model'

@Injectable()
export class RecurrenceRepo {
  constructor(
    @Inject(RecurrenceModel)
    private readonly recurrenceModel: typeof RecurrenceModel
  ) {}
}
