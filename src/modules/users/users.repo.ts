import {Inject} from '@nestjs/common'
import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import {taskEitherQuery} from 'src/shared/task-either-query'
import {
  UserModel,
  SyncUserMeta,
  InsertableUser,
  UserEntity
} from './users.model'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'

@Injectable()
export class UsersRepo {
  constructor(
    @Inject(UserModel) private readonly usersModel: typeof UserModel
  ) {}

  SyncUser(
    user: UserRecord,
    meta: SyncUserMeta
  ): TE.TaskEither<UserError, boolean> {
    const entity: InsertableUser = {
      uid: user.uid,
      email: user.email as string, // Expect DB Schema Validation,
      display_name: user.displayName ?? null,
      fcm_token: meta.fcm_token
    }

    return pipe(
      this.IsExist(user.uid),
      TE.chain(exists => {
        return exists ? this.UpdateUser(entity) : this.InsertUser(entity)
      })
    )
  }

  InsertUser(entity: InsertableUser) {
    return pipe(
      taskEitherQuery(() =>
        this.usersModel.query().insert({
          uid: entity.uid,
          email: entity.email,
          display_name: entity.display_name,
          fcm_token: entity.fcm_token
        })
      ),
      TE.map(Boolean)
    )
  }

  IsExist(uid: UID) {
    return pipe(
      taskEitherQuery(() =>
        this.usersModel.query().select('uid').findById(uid)
      ),
      TE.map(Boolean)
    )
  }

  UpdateUser(entity: InsertableUser) {
    return pipe(
      taskEitherQuery(() => {
        return this.usersModel.query().where('uid', entity.uid).patch({
          email: entity.email,
          display_name: entity.display_name,
          fcm_token: entity.fcm_token
        })
      }),
      TE.map(count => count === 1)
    )
  }

  FindUser(uid: UID) {
    return taskEitherQuery(() => {
      return this.usersModel.query().findOne('uid', uid)
    })
  }

  FindUsersByIds(
    uids: Array<UID>
  ): TE.TaskEither<UserError, Array<UserEntity>> {
    return taskEitherQuery(() => {
      return this.usersModel.query().whereIn('uid', uids).limit(uids.length)
    })
  }

  FindUserByEmail(email: string): TE.TaskEither<UserError, UserEntity> {
    return taskEitherQuery(() => {
      return this.usersModel.query().findOne({email}).throwIfNotFound()
    })
  }
}
