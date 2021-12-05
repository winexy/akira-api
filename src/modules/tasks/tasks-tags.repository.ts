import {Inject, Injectable} from '@nestjs/common'
import {Transaction} from 'objection'
import {TasksTagsModel, TaskTag} from './tasks-tags.model'
import {Tag} from '../tags/tag.model'
import {TaskT} from './task.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from '../../filters/user-error.exception.filter'
import {taskEitherQuery} from 'src/shared/task-either-query'

@Injectable()
export class TasksTagsRepo {
  constructor(
    @Inject(TasksTagsModel)
    private readonly tasksTagsModel: typeof TasksTagsModel
  ) {}

  CreateTaskTag(
    taskId: TaskT['id'],
    tagId: Tag['id']
  ): TE.TaskEither<UserError, TaskTag> {
    return taskEitherQuery(() => {
      return this.tasksTagsModel
        .query()
        .insert({
          task_id: taskId,
          tag_id: tagId
        })
        .returning('*')
    })
  }

  DeleteTaskTag(
    taskId: TaskT['id'],
    tagId: Tag['id']
  ): TE.TaskEither<UserError, number> {
    return taskEitherQuery(() => {
      return this.tasksTagsModel
        .query()
        .delete()
        .where({
          task_id: taskId,
          tag_id: tagId
        })
        .throwIfNotFound()
    })
  }

  AddTags(taskId: TaskT['id'], tags: Array<Tag['id']>, trx?: Transaction) {
    return this.tasksTagsModel.query(trx).insertGraph(
      tags.map(id => ({
        task_id: taskId,
        tag_id: id
      }))
    )
  }
}
