import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import * as E from 'fp-ts/lib/Either'
import {User} from 'src/decorators/user.decorator'
import {AuthGuard} from 'src/auth.guard'
import {NotesService} from './notes.service'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {notePatchSchema, NotePatch} from './note.model'

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('preview')
  async FindNotesPreview(@User('uid') uid: UID) {
    const result = await this.notesService.FindNotesPreview(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Post()
  async CreateEmptyNote(@User('uid') uid: UID) {
    const result = await this.notesService.CreateEmptyNote(uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get(':noteId')
  async FindOne(@Param('noteId') noteId: string, @User('uid') uid: UID) {
    const result = await this.notesService.FindOne(noteId, uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Patch(':noteId')
  async PatchNote(
    @Param('noteId') noteId: string,
    @User('uid') uid: UID,
    @Body(FujiPipe.of(notePatchSchema)) dto: NotePatch
  ) {
    const result = await this.notesService.PatchNote(noteId, uid, dto)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
