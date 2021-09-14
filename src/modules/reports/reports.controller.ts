import {Controller, Get, Query, UseGuards} from '@nestjs/common'
import {f, string, pattern} from '@winexy/fuji'
import {ReportsService} from './reports.service'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {AuthGuard} from '../../auth.guard'
import {User} from '../../decorators/user.decorator'

const dateSchema = f(string(), pattern(/\d{4}-\d{1,2}-\d{1,2}/))

@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('')
  async findOne(
    @User('uid') uid: UID,
    @Query('date', FujiPipe.of(dateSchema)) date: string
  ) {
    const result = await this.reportsService.findFor(uid, date)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }
}
