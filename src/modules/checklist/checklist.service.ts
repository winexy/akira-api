import {Injectable} from '@nestjs/common'
import {ChecklistRepo} from './checklist.repository'
import {CreateTodoDto} from './create-todo.dto'

@Injectable()
export class ChecklistService {
  constructor(private readonly checklistRepo: ChecklistRepo) {}

  addTodo(dto: CreateTodoDto) {
    return this.checklistRepo.addTodo(dto)
  }
}
