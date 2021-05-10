import {Inject, Injectable} from '@nestjs/common'
import {ChecklistModel} from './checklist.model'

@Injectable()
export class ChecklistRepo {
  constructor(
    @Inject(ChecklistModel)
    private readonly checklistModel: typeof ChecklistModel
  ) {}
}
