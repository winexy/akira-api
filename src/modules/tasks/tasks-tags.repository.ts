import {Inject, Injectable} from '@nestjs/common'
import {Transaction} from 'objection'
import {TasksTagsModel, TaskTag} from './tasks-tags.model'
import {Tag} from '../tags/tag.model'
import {TaskT} from './task.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {transformRejectReason} from '../../shared/transform-reject-reason'
import {UserError} from '../../filters/user-error.exception.filter'

@Injectable()
export class TasksTagsRepo {
  constructor(
    @Inject(TasksTagsModel)
    private readonly tasksTagsModel: typeof TasksTagsModel
  ) {}

  createTaskTag(
    taskId: TaskT['id'],
    tagId: Tag['id']
  ): TE.TaskEither<UserError, TaskTag> {
    return TE.tryCatch(() => {
      return this.tasksTagsModel
        .query()
        .insert({
          task_id: taskId,
          tag_id: tagId
        })
        .returning('*')
    }, transformRejectReason)
  }

  deleteTaskTag(
    taskId: TaskT['id'],
    tagId: Tag['id']
  ): TE.TaskEither<UserError, number> {
    return TE.tryCatch(() => {
      return this.tasksTagsModel
        .query()
        .delete()
        .where({
          task_id: taskId,
          tag_id: tagId
        })
        .throwIfNotFound()
    }, transformRejectReason)
  }

  addTags(taskId: TaskT['id'], tags: Array<Tag['id']>, trx?: Transaction) {
    return this.tasksTagsModel.query(trx).insertGraph(
      tags.map(id => ({
        task_id: taskId,
        tag_id: id
      }))
    )
  }
}
