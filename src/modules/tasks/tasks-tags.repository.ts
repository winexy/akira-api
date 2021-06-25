import {Inject, Injectable} from '@nestjs/common'
import {TasksTagsModel} from './tasks-tags.model'
import {Tag} from '../tags/tag.model'
import {TaskT} from './task.model'
import {left, right} from '@sweet-monads/either'

@Injectable()
export class TasksTagsRepo {
  constructor(
    @Inject(TasksTagsModel)
    private readonly tasksTagsModel: typeof TasksTagsModel
  ) {}

  createTaskTag(taskId: TaskT['id'], tagId: Tag['id']) {
    return this.tasksTagsModel
      .query()
      .insert({
        task_id: taskId,
        tag_id: tagId
      })
      .returning('*')
  }

  async deleteTaskTag(
    taskId: TaskT['id'],
    tagId: Tag['id']
  ): EitherP<DBException, number> {
    try {
      const result = await this.tasksTagsModel
        .query()
        .delete()
        .where({
          task_id: taskId,
          tag_id: tagId
        })
        .throwIfNotFound()

      return right(result)
    } catch (error) {
      return left(error)
    }
  }
}
