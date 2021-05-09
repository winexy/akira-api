import {HttpException, Injectable, PipeTransform} from '@nestjs/common'
import {Fuji, runWith} from '@winexy/fuji'

@Injectable()
export class FujiPipe<T> implements PipeTransform {
  constructor(private readonly schema: Fuji<T>) {}

  transform(value: any) {
    const errors = runWith(this.schema, value)

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
