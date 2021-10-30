import {Injectable} from '@nestjs/common'
import {TasksRepo} from './tasks.repository'
import {
  TaskId,
  TaskPatchT,
  TaskT,
  CreateTaskDto,
  TasksQueryFiltersT
} from './task.model'
import {Tag} from '../tags/tag.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {TaskTag} from './tasks-tags.model'
import {TaskSchedulerService} from '../task-scheduler/task-scheduler.service'
import {constant, pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'
import {NotFoundError, Transaction} from 'objection'
import {getCloneTaskPayload} from './utils/get-clone-task-payload'
import {Recurrence} from '../recurrence/recurrence.model'

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepo: TasksRepo,
    private readonly taskTagsRepo: TasksTagsRepo,
    private readonly taskSchedulerService: TaskSchedulerService
  ) {}

  create(uid: UID, taskDto: CreateTaskDto) {
    return pipe(
      this.tasksRepo.create(uid, taskDto),
      TE.chain(this.tasksRepo.findOne(uid))
    )
  }

  findAllByUID(uid: UID, query: TasksQueryFiltersT) {
    return this.tasksRepo.findAllByUID(uid, query)
  }

  findOne(taskId: TaskId, uid: UID) {
    return this.tasksRepo.findOne(uid)(taskId)
  }

  search(uid: UID, query: string) {
    return this.tasksRepo.search(uid, query)
  }

  toggleCompleted(taskId: TaskId, uid: UID) {
    return pipe(
      this.findOne(taskId, uid),
      TE.chain(task => {
        return this.tasksRepo.update(taskId, uid, {
          is_completed: !task.is_completed
        })
      })
    )
  }

  toggleImportant(taskId: TaskId, uid: UID) {
    return pipe(
      this.findOne(taskId, uid),
      TE.chain(task => {
        return this.tasksRepo.update(taskId, uid, {
          is_important: !task.is_important
        })
      })
    )
  }

  deleteOne(taskId: TaskId, uid: UID): TE.TaskEither<UserError, boolean> {
    return this.tasksRepo.deleteOne(taskId, uid)
  }

  ensureAuthority(taskId: TaskId, uid: UID): TE.TaskEither<UserError, true> {
    return pipe(
      this.findOne(taskId, uid),
      TE.mapLeft(error => {
        if (error instanceof NotFoundError) {
          return UserError.of({
            type: UserError.NoAccess,
            message: `User(${uid}) has no access to Task(${taskId})`,
            meta: {
              error
            }
          })
        }

        return UserError.of({
          type: UserError.Internal,
          message: '...',
          meta: {
            error
          }
        })
      }),
      TE.map(constant(true))
    )
  }

  patchTask(
    uid: UID,
    taskId: TaskId,
    patch: TaskPatchT
  ): TE.TaskEither<UserError, TaskT> {
    return this.tasksRepo.update(taskId, uid, patch)
  }

  createTag(
    uid: UID,
    taskId: TaskId,
    tagId: Tag['id']
  ): TE.TaskEither<UserError, TaskTag> {
    return pipe(
      this.ensureAuthority(taskId, uid),
      TE.chain(() => this.taskTagsRepo.createTaskTag(taskId, tagId))
    )
  }

  deleteTag(
    uid: UID,
    taskId: TaskId,
    tagId: Tag['id']
  ): TE.TaskEither<UserError, number> {
    return pipe(
      this.ensureAuthority(taskId, uid),
      TE.chain(() => this.taskTagsRepo.deleteTaskTag(taskId, tagId))
    )
  }

  async findByUpdatedAtDate(uid: UID, date: string) {
    return this.tasksRepo.findByUpdatedDate(uid, date)
  }

  InternalCloneTask(trx?: Transaction) {
    return (recurrence: Recurrence) => {
      return pipe(
        this.tasksRepo.InternalFindOne(trx)(recurrence.source_task_id),
        TE.map(getCloneTaskPayload),
        TE.chain(this.tasksRepo.InsertClonedTask(trx))
      )
    }
  }
}
