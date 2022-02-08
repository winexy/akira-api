import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common'
import {AuthGuard} from 'src/auth.guard'
import {User} from 'src/decorators/user.decorator'
import {UsersService} from './users.service'
import {SyncUserMeta, syncUserMetaSchema} from './users.model'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {doTask} from 'src/shared/do-task'

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  SyncUser(
    @User() user: UserRecord,
    @Body(FujiPipe.of(syncUserMetaSchema)) meta: SyncUserMeta
  ) {
    return doTask(this.usersService.SyncUser(user, meta))
  }

  @Get('whoami')
  whoami(@User('uid') uid: UID) {
    return doTask(this.usersService.FindUser(uid))
  }
}
