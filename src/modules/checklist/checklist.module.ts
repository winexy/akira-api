import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {ChecklistService} from './checklist.service'
import {ChecklistController} from './checklist.controller'
import {ChecklistModel} from './checklist.model'
import {ChecklistRepo} from './checklist.repository'

@Module({
  imports: [ObjectionModule.forFeature([ChecklistModel])],
  providers: [ChecklistService, ChecklistRepo],
  controllers: [ChecklistController]
})
export class ChecklistModule {}
