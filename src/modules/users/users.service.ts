import {Injectable} from '@nestjs/common'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'
import {SyncUserMeta, UserEntity, PublicUserEntity} from './users.model'
import {UsersRepo} from './users.repo'
import {toPublicUser} from './utils/to-public-user'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepo) {}

  SyncUser(
    user: UserRecord,
    meta: SyncUserMeta
  ): TE.TaskEither<UserError, boolean> {
    return this.usersRepo.SyncUser(user, meta)
  }

  FindUser(uid: UID) {
    return this.usersRepo.FindUser(uid)
  }

  FindUsersByIds() {
    return (uids: Array<UID>) => this.usersRepo.FindUsersByIds(uids)
  }

  FindUserByEmail(email: string): TE.TaskEither<UserError, UserEntity> {
    return this.usersRepo.FindUserByEmail(email)
  }

  PublicFindUserByEmail(
    email: string
  ): TE.TaskEither<UserError, PublicUserEntity | null> {
    return pipe(
      this.FindUserByEmail(email),
      TE.map(toPublicUser),
      TE.altW(() => TE.of(null))
    )
  }
}
