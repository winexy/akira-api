import {HttpException, Injectable, PipeTransform} from '@nestjs/common'
import {Fuji, FujiConfig, RuleType, run} from '@winexy/fuji'

@Injectable()
export class FujiPipe<Types extends RuleType, T> implements PipeTransform {
  constructor(
    private readonly schema: Fuji<Types, T>,
    private readonly config?: Partial<FujiConfig>
  ) {}

  static of<Types extends RuleType, T>(
    schema: Fuji<Types, T>,
    config?: Partial<FujiConfig>
  ) {
    return new FujiPipe(schema, config)
  }

  transform(value: any) {
    const result = run(this.schema, value, this.config)

    if (result.invalid) {
      throw new HttpException(
        {
          type: 'validation-error',
          errors: result.errors
        },
        400
      )
    }

    return value
  }
}
