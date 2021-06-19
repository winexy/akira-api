import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import {TasksService} from './tasks.service'
import {AuthGuard} from '../../auth.guard'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {User} from 'src/decorators/user.decorator'
import {TasksQueryFiltersT, tasksQueryFiltersSchema} from './task.model'
import {
  TaskPatchT,
  TaskT,
  TaskIdT,
  taskPatchSchema,
  CreateTaskDto,
  createTaskDtoSchema
} from './task.model'

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  @HttpCode(201)
  create(
    @Body(FujiPipe.of(createTaskDtoSchema))
    taskDto: CreateTaskDto
  ) {
    return this.taskService.create(taskDto)
  }

  @Get()
  findAll(
    @User() user: UserRecord,
    @Query(FujiPipe.of(tasksQueryFiltersSchema)) query: TasksQueryFiltersT
  ) {
    return this.taskService.findAllByUID(user.uid, query)
  }

  @Get('today')
  findTodayTasks(@User('uid') uid: UID) {
    return this.taskService.findTodayTasksByUID(uid)
  }

  @Get(':id')
  async findOne(@User() user: UserRecord, @Param('id') id: TaskT['id']) {
    const task = await this.taskService.findOne(id, user.uid)

    if (task.isLeft()) {
      throw task.value
    }

    return task.value
  }

  @Patch(':id')
  async patchTask(
    @User('uid') uid: UID,
    @Param('id') id: TaskIdT,
    @Body(FujiPipe.of(taskPatchSchema)) patch: TaskPatchT
  ) {
    const result = await this.taskService.patchTask(uid, id, patch)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Patch(':id/complete/toggle')
  async toggleCompleted(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    const task = await this.taskService.toggleCompleted(taskId, user.uid)

    if (task.isLeft()) {
      throw task.value
    }

    return task.value
  }

  @Patch(':id/important/toggle')
  async toggleImportant(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    const task = await this.taskService.toggleImportant(taskId, user.uid)

    if (task.isLeft()) {
      throw task.value
    }

    return task.value
  }

  @Delete(':id')
  async deleteOne(@User() user: UserRecord, @Param('id') taskId: TaskT['id']) {
    const result = await this.taskService.deleteOne(taskId, user.uid)

    if (result.isLeft()) {
      throw result.value
    }

    if (!result.value) {
      throw new InternalServerErrorException('failed to delete task')
    }

    return result.value
  }
}
