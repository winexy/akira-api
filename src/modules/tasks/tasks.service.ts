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

  Create(uid: UID, taskDto: CreateTaskDto) {
    return pipe(
      this.tasksRepo.Create(uid, taskDto),
      TE.chain(this.tasksRepo.FindOne(uid))
    )
  }

  FindAllByUID(uid: UID, query: TasksQueryFiltersT) {
    return this.tasksRepo.FindAllByUID(uid, query)
  }

  FindOne(taskId: TaskId, uid: UID) {
    return this.tasksRepo.FindOne(uid)(taskId)
  }

  Search(uid: UID, query: string) {
    return this.tasksRepo.Search(uid, query)
  }

  ToggleCompleted(taskId: TaskId, uid: UID) {
    return pipe(
      this.FindOne(taskId, uid),
      TE.chain(task => {
        return this.tasksRepo.Update(taskId, uid, {
          is_completed: !task.is_completed
        })
      })
    )
  }

  ToggleImportant(taskId: TaskId, uid: UID) {
    return pipe(
      this.FindOne(taskId, uid),
      TE.chain(task => {
        return this.tasksRepo.Update(taskId, uid, {
          is_important: !task.is_important
        })
      })
    )
  }

  DeleteOne(taskId: TaskId, uid: UID): TE.TaskEither<UserError, boolean> {
    return this.tasksRepo.DeleteOne(taskId, uid)
  }

  EnsureAuthority(taskId: TaskId, uid: UID): TE.TaskEither<UserError, true> {
    return pipe(
      this.FindOne(taskId, uid),
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

  PatchTask(
    uid: UID,
    taskId: TaskId,
    patch: TaskPatchT
  ): TE.TaskEither<UserError, TaskT> {
    return this.tasksRepo.Update(taskId, uid, patch)
  }

  CreateTag(
    uid: UID,
    taskId: TaskId,
    tagId: Tag['id']
  ): TE.TaskEither<UserError, TaskTag> {
    return pipe(
      this.EnsureAuthority(taskId, uid),
      TE.chain(() => this.taskTagsRepo.CreateTaskTag(taskId, tagId))
    )
  }

  DeleteTag(
    uid: UID,
    taskId: TaskId,
    tagId: Tag['id']
  ): TE.TaskEither<UserError, number> {
    return pipe(
      this.EnsureAuthority(taskId, uid),
      TE.chain(() => this.taskTagsRepo.DeleteTaskTag(taskId, tagId))
    )
  }

  async FindByUpdatedAtDate(uid: UID, date: string) {
    return this.tasksRepo.FindByUpdatedDate(uid, date)
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
