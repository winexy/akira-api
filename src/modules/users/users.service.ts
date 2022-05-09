import {Injectable} from '@nestjs/common'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'
import {SyncUserMeta} from './users.model'
import {UsersRepo} from './users.repo'

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
}
