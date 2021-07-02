import {Module} from '@nestjs/common'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {ListsController} from './lists.controller'
import {ListsService} from './lists.service'
import {ListModel} from './list.model'
import {ListsRepo} from './lists.repository'

@Module({
  imports: [ObjectionModule.forFeature([ListModel])],
  controllers: [ListsController],
  providers: [ListsService, ListsRepo]
})
export class ListsModule {}
