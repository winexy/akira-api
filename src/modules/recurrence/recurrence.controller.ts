import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body
} from '@nestjs/common'
import {RecurrenceService} from './recurrence.service'
import {AuthGuard} from '../../auth.guard'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {ruleSchema, RuleSchema} from './recurrence.model'

@UseGuards(AuthGuard)
@Controller('recurrence')
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Post(':taskId')
  create(
    @Param('taskId') taskId: string,
    @Body(FujiPipe.of(ruleSchema)) payload: RuleSchema
  ) {
    console.log({taskId, payload})
    return this.recurrenceService.create()
  }

  @Get()
  findAll() {
    return this.recurrenceService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recurrenceService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.recurrenceService.update(+id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recurrenceService.remove(+id)
  }
}
