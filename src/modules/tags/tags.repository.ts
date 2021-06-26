import {Inject, Injectable} from '@nestjs/common'
import {left, right} from '@sweet-monads/either'
import {UniqueViolationError} from 'db-errors'
import {TagModel, CreateTagDto, Tag} from './tag.model'
import {UserError} from '../../filters/user-error.exception.filter'

@Injectable()
export class TagsRepo {
  constructor(@Inject(TagModel) private readonly tagModel: typeof TagModel) {}

  findAllByUID(uid: UID) {
    return this.tagModel.query().where({uid})
  }

  async createTag(
    uid: UID,
    dto: CreateTagDto
  ): EitherP<DBException | UserError, Tag> {
    try {
      const result = await this.tagModel.query().insert({
        ...dto,
        uid
      })

      return right(result)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return left(
          UserError.of({
            type: 'unique-violation',
            message: `tag "${dto.name}" is already exist`
          })
        )
      }

      return left(error)
    }
  }

  async deleteTag(uid: UID, tagId: Tag['id']) {
    try {
      const result = await this.tagModel
        .query()
        .deleteById(tagId)
        .where({
          uid
        })
        .throwIfNotFound()

      return right(result)
    } catch (error) {
      return left(error)
    }
  }
}
