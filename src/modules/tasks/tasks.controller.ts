import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import * as E from 'fp-ts/lib/Either'
import {TasksService} from './tasks.service'
import {AuthGuard} from '../../auth.guard'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {User} from 'src/decorators/user.decorator'
import {TasksQueryFiltersT, tasksQueryFiltersSchema} from './task.model'
import {Tag} from '../tags/tag.model'
import {
  TaskPatchT,
  TaskT,
  TaskId,
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
  async create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskDtoSchema))
    taskDto: CreateTaskDto
  ): Promise<TaskT> {
    const result = await this.taskService.create(uid, taskDto)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get()
  findAll(
    @User() user: UserRecord,
    @Query(FujiPipe.of(tasksQueryFiltersSchema)) query: TasksQueryFiltersT
  ) {
    return this.taskService.findAllByUID(user.uid, query)
  }

  @Get('search')
  search(@User('uid') uid: UID, @Query('query') query: string) {
    return this.taskService.search(uid, query)
  }

  @Get(':id')
  async findOne(@User() user: UserRecord, @Param('id') id: TaskT['id']) {
    const task = await this.taskService.findOne(id, user.uid)()

    if (E.isLeft(task)) {
      throw task.left
    }

    return task.right
  }

  @Patch(':id')
  async patchTask(
    @User('uid') uid: UID,
    @Param('id') id: TaskId,
    @Body(FujiPipe.of(taskPatchSchema)) patch: TaskPatchT
  ) {
    const result = await this.taskService.patchTask(uid, id, patch)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Patch(':id/complete/toggle')
  async toggleCompleted(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    const task = await this.taskService.toggleCompleted(taskId, user.uid)()

    if (E.isLeft(task)) {
      throw task.left
    }

    return task.right
  }

  @Patch(':id/important/toggle')
  async toggleImportant(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    const task = await this.taskService.toggleImportant(taskId, user.uid)()

    if (E.isLeft(task)) {
      throw task.left
    }

    return task.right
  }

  @Delete(':id')
  async deleteOne(@User() user: UserRecord, @Param('id') taskId: TaskT['id']) {
    const result = await this.taskService.deleteOne(taskId, user.uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    if (!result.right) {
      throw new InternalServerErrorException('failed to delete task')
    }

    return result.right
  }

  @Post(':taskId/tags/:tagId')
  async createTaskTag(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    const result = await this.taskService.createTag(uid, taskId, tagId)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Delete(':taskId/tags/:tagId')
  async deleteTaskTag(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    const result = await this.taskService.deleteTag(uid, taskId, tagId)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
