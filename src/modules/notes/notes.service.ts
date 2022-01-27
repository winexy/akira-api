import {Injectable} from '@nestjs/common'
import {NotesRepo} from './note.repository'
import {NotePatch} from './note.model'
import {taskEitherQuery} from '../../shared/task-either-query'

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

  PatchNote(noteId: string, uid: UID, dto: NotePatch) {
    return this.notesRepo.PatchNote(noteId, uid, dto)
  }
}
