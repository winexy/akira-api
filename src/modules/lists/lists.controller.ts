import {Body, Controller, HttpCode, Post, UseGuards} from '@nestjs/common'
import {User} from 'src/decorators/user.decorator'
import {ListsService} from './lists.service'
import {AuthGuard} from '../../auth.guard'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {CreateTaskListDto, createTaskListSchema} from './list.model'

@Controller('lists')
@UseGuards(AuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @HttpCode(201)
  create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskListSchema)) dto: CreateTaskListDto
  ) {
    return this.listsService.create(uid, dto.title)
  }
}
