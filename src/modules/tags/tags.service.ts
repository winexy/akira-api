import {Injectable} from '@nestjs/common'
import {TagsRepo} from './tags.repository'
import {CreateTagDto, Tag} from './tag.model'

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepo: TagsRepo) {}

  FindAll(uid: UID) {
    return this.tagsRepo.FindAllByUID(uid)
  }

  CreateTag(uid: UID, dto: CreateTagDto) {
    return this.tagsRepo.CreateTag(uid, dto)
  }

  DeleteTag(uid: UID, tagId: Tag['id']) {
    return this.tagsRepo.DeleteTag(uid, tagId)
  }
}
