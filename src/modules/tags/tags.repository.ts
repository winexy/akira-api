import {Inject, Injectable} from '@nestjs/common'
import {UniqueViolationError} from 'db-errors'
import {TagModel, CreateTagDto, Tag} from './tag.model'
import {UserError, UserErrorEnum} from 'src/filters/user-error.exception.filter'
import {transformRejectReason} from 'src/shared/transform-reject-reason'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'

@Injectable()
export class TagsRepo {
  constructor(@Inject(TagModel) private readonly tagModel: typeof TagModel) {}

  FindAllByUID(uid: UID) {
    return this.tagModel.query().where({uid})
  }

  CreateTag(uid: UID, dto: CreateTagDto): TE.TaskEither<UserError, Tag> {
    return pipe(
      TE.tryCatch(() => {
        return this.tagModel.query().insert({...dto, uid})
      }, transformRejectReason),
      TE.mapLeft(error => {
        if (error instanceof UniqueViolationError) {
          return UserError.of({
            type: UserErrorEnum.Duplicate,
            message: `tag "${dto.name}" is already exist`,
            meta: {
              name: dto.name
            }
          })
        }

        return error
      })
    )
  }

  DeleteTag(uid: UID, tagId: Tag['id']): TE.TaskEither<UserError, number> {
    return TE.tryCatch(() => {
      return this.tagModel
        .query()
        .deleteById(tagId)
        .where({
          uid
        })
        .throwIfNotFound()
    }, transformRejectReason)
  }
}
