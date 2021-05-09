import {Inject, Injectable} from '@nestjs/common'
import {TaskModel} from './task.model'
import {CreateTaskDto} from './create-task.dto'

@Injectable()
export class TasksRepo {
  constructor(
    @Inject(TaskModel) private readonly taskModel: typeof TaskModel
  ) {}

  create(taskDto: CreateTaskDto) {
    return this.taskModel.transaction(trx => {
      return this.taskModel.query(trx).insert(taskDto).returning('*')
    })
  }
    })
  }
}
