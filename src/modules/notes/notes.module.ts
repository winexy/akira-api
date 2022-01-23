import {ObjectionModule} from '@willsoto/nestjs-objection'
import {Module} from '@nestjs/common'
import {NoteModel} from './note.model'
import {NotesController} from './notes.controller'
import {NotesService} from './notes.service'
import {NotesRepo} from './note.repository'

@Module({
  imports: [ObjectionModule.forFeature([NoteModel])],
  controllers: [NotesController],
  providers: [NotesService, NotesRepo]
})
export class NotesModule {}
