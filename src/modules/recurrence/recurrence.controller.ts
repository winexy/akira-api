import {Controller, Get, Post, Patch, Param, Delete} from '@nestjs/common'
import {RecurrenceService} from './recurrence.service'

@Controller('recurrence')
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Post()
  create() {
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
