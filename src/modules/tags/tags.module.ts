import {Module} from '@nestjs/common'
import {TagsController} from './tags.controller'
import {TagsService} from './tags.service'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TagModel} from './tag.model'
import {TagsRepo} from './tags.repository'

@Module({
  imports: [ObjectionModule.forFeature([TagModel])],
  controllers: [TagsController],
  providers: [TagsService, TagsRepo]
})
export class TagsModule {}
