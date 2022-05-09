import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {UsersController} from './users.controller'
import {UsersRepo} from './users.repo'
import {UsersService} from './users.service'
import {UserModel} from './users.model'

@Module({
  imports: [ObjectionModule.forFeature([UserModel])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepo],
  exports: [UsersService]
})
export class UsersModule {}
