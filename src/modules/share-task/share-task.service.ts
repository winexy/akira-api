import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {TasksService} from 'src/modules/tasks/tasks.service'
import {UserError} from 'src/filters/user-error.exception.filter'
import {SharedTaskRepo} from '../share-task/shared-task.repo'

@Injectable()
export class ShareTaskService {
  constructor(
    private readonly shareTaskRepo: SharedTaskRepo,
    private readonly tasksService: TasksService
  ) {}

  RevokeAccess(uid: UID, id: number): TE.TaskEither<UserError, boolean> {
    return pipe(
      this.shareTaskRepo.FindOne(id),
      TE.map(entry => entry.task_id),
      TE.chain(taskId => this.tasksService.EnsureAuthority(taskId, uid)),
      TE.chain(() => this.shareTaskRepo.DeleteAccessEntry(id))
    )
  }
}
