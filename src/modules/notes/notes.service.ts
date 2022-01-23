import {Injectable} from '@nestjs/common'
import {NotesRepo} from './note.repository'

@Injectable()
export class NotesService {
  constructor(private readonly notesRepo: NotesRepo) {}

  FindNotesPreview(uid: UID) {
    return this.notesRepo.FindNotesPreview(uid)
  }

  CreateEmptyNote(uid: UID) {
    return this.notesRepo.CreateEmptyNote(uid)
  }

  FindOne(noteId: string, uid: UID) {
    return this.notesRepo.FindOne(noteId, uid)
  }
}
