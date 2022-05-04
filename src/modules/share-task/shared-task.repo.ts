import {Inject, Injectable} from '@nestjs/common'
import {taskEitherQuery} from 'src/shared/task-either-query'
import * as TE from 'fp-ts/lib/TaskEither'
import {
  SharedTask,
  SharedTaskModel,
  SharedTaskPatchDto,
  CreateSharedTaskDto
} from './shared-task.model'
import {UserError} from 'src/filters/user-error.exception.filter'
import {UserErrorEnum} from '../../filters/user-error.exception.filter'

@Injectable()
export class SharedTaskRepo {
  constructor(
    @Inject(SharedTaskModel) private readonly model: typeof SharedTaskModel
  ) {}

  Create(dto: CreateSharedTaskDto): TE.TaskEither<UserError, SharedTask> {
    return taskEitherQuery(() => this.model.query().insert(dto))
  }

  Patch(
    id: number,
    patch: SharedTaskPatchDto
  ): TE.TaskEither<UserError, SharedTask> {
    return taskEitherQuery(() =>
      this.model.query().patchAndFetchById(id, patch)
    )
  }

  FindOne(id: number): TE.TaskEither<UserError, SharedTask> {
    return taskEitherQuery(() =>
      this.model.query().findOne('id', id).throwIfNotFound()
    )
  }

  DeleteAccessEntry(id: number): TE.TaskEither<UserError, boolean> {
    return taskEitherQuery(async () => {
      const count = await this.model.query().deleteById(id)

      if (count === 0) {
        throw UserError.of({
          type: UserErrorEnum.UnknownDbQuery,
          message: `Failed to delete shared task access. Id=${id}`
        })
      }

      return true
    })
  }
}
