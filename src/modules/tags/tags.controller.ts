import {Body, Controller, Get, HttpCode, Post, UseGuards} from '@nestjs/common'
import {User} from 'src/decorators/user.decorator'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {createTagSchema, CreateTagDto} from './tag.model'
import {TagsService} from './tags.service'
import {AuthGuard} from '../../auth.guard'

@UseGuards(AuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@User('uid') uid: UID) {
    return this.tagsService.findAll(uid)
  }

  @Post()
  @HttpCode(201)
  createTag(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTagSchema)) dto: CreateTagDto
  ) {
    return this.tagsService.createTag(uid, dto)
  }
}
