import {HttpException, Injectable, PipeTransform} from '@nestjs/common'
import {Fuji, FujiConfig, runWith} from '@winexy/fuji'

@Injectable()
export class FujiPipe<T> implements PipeTransform {
  constructor(
    private readonly schema: Fuji<T>,
    private readonly config?: Partial<FujiConfig>
  ) {}

  static of<T>(schema: Fuji<T>, config?: Partial<FujiConfig>) {
    return new FujiPipe(schema, config)
  }

  transform(value: any) {
    const errors = runWith(this.schema, value, this.config)

    if (errors.length > 0) {
      throw new HttpException(
        {
          type: 'validation-error',
          errors
        },
        400
      )
    }

    return value
  }
}
