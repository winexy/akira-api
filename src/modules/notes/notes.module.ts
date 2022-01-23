import {ObjectionModule} from '@willsoto/nestjs-objection'
import {Module} from '@nestjs/common'
import {NoteModel} from './note.model'
import {NotesController} from './notes.controller'

@Module({
  imports: [ObjectionModule.forFeature([NoteModel])],
  controllers: [NotesController],
  providers: []
})
export class NotesModule {}
