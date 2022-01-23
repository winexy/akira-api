import {Inject, Injectable, Logger} from '@nestjs/common'
import {NoteModel} from './note.model'

@Injectable()
export class NotesRepo {
  private readonly logger = new Logger(NotesRepo.name)

  constructor(
    @Inject(NoteModel)
    private readonly noteModel: typeof NoteModel
  ) {}
}
