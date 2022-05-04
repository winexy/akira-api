import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {TasksService} from 'src/modules/tasks/tasks.service'
import {UserError} from 'src/filters/user-error.exception.filter'
import {SharedTaskRepo} from '../share-task/shared-task.repo'
import {SharedTask} from '../share-task/shared-task.model'
import {SharedTaskPatchDto, CreateSharedTaskDto} from './shared-task.model'

@Injectable()
export class ShareTaskService {
  constructor(
    private readonly shareTaskRepo: SharedTaskRepo,
    private readonly tasksService: TasksService
  ) {}

  Create(
    uid: UID,
    dto: CreateSharedTaskDto
  ): TE.TaskEither<UserError, SharedTask> {
    return pipe(
      this.tasksService.EnsureAuthority(dto.task_id, uid),
      TE.chain(() => this.shareTaskRepo.Create(dto))
    )
  }

  Update(
    uid: UID,
    id: number,
    patch: SharedTaskPatchDto
  ): TE.TaskEither<UserError, SharedTask> {
    return pipe(
      this.EnsureAuthority(id, uid),
      TE.chain(() => this.shareTaskRepo.Patch(id, patch))
    )
  }

  FindOneById(uid: UID, id: number): TE.TaskEither<UserError, SharedTask> {
    return this.EnsureAuthority(id, uid)
  }

  RevokeAccess(uid: UID, id: number): TE.TaskEither<UserError, boolean> {
    return pipe(
      this.EnsureAuthority(id, uid),
      TE.chain(() => this.shareTaskRepo.DeleteAccessEntry(id))
    )
  }

  private EnsureAuthority(id: number, uid: UID) {
    return pipe(
      this.shareTaskRepo.FindOne(id),
      TE.chainFirst(entry =>
        this.tasksService.EnsureAuthority(entry.task_id, uid)
      )
    )
  }
}
