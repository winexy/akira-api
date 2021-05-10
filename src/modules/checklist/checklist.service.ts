import {Injectable} from '@nestjs/common'
import {ChecklistRepo} from './checklist.repository'

@Injectable()
export class ChecklistService {
  constructor(private readonly checklistRepo: ChecklistRepo) {}
}
