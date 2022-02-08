import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import {doTask} from 'src/shared/do-task'
import {User} from 'src/decorators/user.decorator'
import {AuthGuard} from 'src/auth.guard'
import {NotesService} from './notes.service'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {notePatchSchema, NotePatch} from './note.model'

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('preview')
  FindNotesPreview(@User('uid') uid: UID) {
    return doTask(this.notesService.FindNotesPreview(uid))
  }

  @Post()
  CreateEmptyNote(@User('uid') uid: UID) {
    return doTask(this.notesService.CreateEmptyNote(uid))
  }

  @Get(':noteId')
  FindOne(@Param('noteId') noteId: string, @User('uid') uid: UID) {
    return doTask(this.notesService.FindOne(noteId, uid))
  }

  @Patch(':noteId')
  PatchNote(
    @Param('noteId') noteId: string,
    @User('uid') uid: UID,
    @Body(FujiPipe.of(notePatchSchema)) dto: NotePatch
  ) {
    return doTask(this.notesService.PatchNote(noteId, uid, dto))
  }
}
