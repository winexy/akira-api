import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from '@nestjs/common'
import {User} from 'src/decorators/user.decorator'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {createTagSchema, CreateTagDto, Tag} from './tag.model'
import {TagsService} from './tags.service'
import {AuthGuard} from '../../auth.guard'
import * as E from 'fp-ts/lib/Either'

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
  async createTag(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTagSchema)) dto: CreateTagDto
  ) {
    const result = await this.tagsService.createTag(uid, dto)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Delete(':tagId')
  async deleteTag(
    @User('uid') uid: UID,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    const result = await this.tagsService.deleteTag(uid, tagId)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
