import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common'
import {AuthGuard} from 'src/auth.guard'
import {User} from 'src/decorators/user.decorator'
import {UsersService} from './users.service'
import {SyncUserMeta, syncUserMetaSchema} from './users.model'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import * as E from 'fp-ts/lib/Either'

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  async SyncUser(
    @User() user: UserRecord,
    @Body(FujiPipe.of(syncUserMetaSchema)) meta: SyncUserMeta
  ) {
    const result = await this.usersService.SyncUser(user, meta)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get('whoami')
  async whoami(@User('uid') uid: UID) {
    const result = await this.usersService.FindUser(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
