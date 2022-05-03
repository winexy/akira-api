import {Inject, Injectable} from '@nestjs/common'
import {SharedTaskModel} from './shared-task.model'

@Injectable()
export class SharedTaskRepo {
  constructor(
    @Inject(SharedTaskModel) private readonly model: typeof SharedTaskModel
  ) {}
}
