import {Injectable} from '@nestjs/common'
import {TagsRepo} from './tags.repository'
import {CreateTagDto} from './tag.model'

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepo: TagsRepo) {}

  findAll(uid: UID) {
    return this.tagsRepo.findAllByUID(uid)
  }

  createTag(uid: UID, dto: CreateTagDto) {
    return this.tagsRepo.createTag(uid, dto)
  }
}
