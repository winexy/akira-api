import {Injectable} from '@nestjs/common'
import {ListsRepo} from './lists.repository'

@Injectable()
export class ListsService {
  constructor(private readonly listRepo: ListsRepo) {}

  async create(uid: UID, title: string) {
  }
}
