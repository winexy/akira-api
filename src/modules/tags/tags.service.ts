import {Injectable} from '@nestjs/common'
import {TagsRepo} from './tags.repository'
import {CreateTagDto, Tag} from './tag.model'

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepo: TagsRepo) {}

  findAll(uid: UID) {
    return this.tagsRepo.findAllByUID(uid)
  }

  createTag(uid: UID, dto: CreateTagDto) {
    return this.tagsRepo.createTag(uid, dto)
  }

  deleteTag(uid: UID, tagId: Tag['id']) {
    return this.tagsRepo.deleteTag(uid, tagId)
  }
}
