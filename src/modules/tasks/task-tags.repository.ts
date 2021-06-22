import {Inject, Injectable} from '@nestjs/common'
import {TasksTagsModel} from './task-tags.model'
import {Tag} from '../tags/tag.model'
import {TaskT} from './task.model'

@Injectable()
export class TasksTagsRepository {
  constructor(
    @Inject(TasksTagsModel)
    private readonly taskTagsModel: typeof TasksTagsModel
  ) {}

  createTaskTag(taskId: TaskT['id'], tagId: Tag['id']) {
    return this.taskTagsModel
      .query()
      .insert({
        task_id: taskId,
        tag_id: tagId
      })
      .returning('*')
  }
}
