import {Module} from '@nestjs/common'
import {TagsController} from './tags.controller'
import {TagsService} from './tags.service'
import {ObjectionModule} from '@willsoto/nestjs-objection'
import {TagModel} from './tag.model'

@Module({
  imports: [ObjectionModule.forFeature([TagModel])],
  controllers: [TagsController],
  providers: [TagsService]
})
export class TagsModule {}
