import {Controller, Get, Query, UseGuards} from '@nestjs/common'
import {f, string, pattern} from '@winexy/fuji'
import {doTask} from 'src/shared/do-task'
import {ReportsService} from './reports.service'
import {FujiPipe} from 'src/pipes/fuji.pipe'
import {AuthGuard} from 'src/auth.guard'
import {User} from 'src/decorators/user.decorator'

const dateSchema = f(string(), pattern(/\d{4}-\d{1,2}-\d{1,2}/))

@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('')
  FindOne(
    @User('uid') uid: UID,
    @Query('date', FujiPipe.of(dateSchema)) date: string
  ) {
    return doTask(this.reportsService.FindFor(uid, date))
  }
}
