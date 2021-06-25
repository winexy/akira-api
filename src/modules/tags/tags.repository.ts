import {Inject, Injectable} from '@nestjs/common'
import {TagModel, CreateTagDto} from './tag.model'

@Injectable()
export class TagsRepo {
  constructor(@Inject(TagModel) private readonly tagModel: typeof TagModel) {}

  findAllByUID(uid: UID) {
    return this.tagModel.query().where({uid})
  }

  createTag(uid: UID, dto: CreateTagDto) {
    return this.tagModel.query().insert({
      ...dto,
      uid
    })
  }
}
