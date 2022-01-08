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
import {DueDateWorker} from './due-date.worker'
import {SuperUserGuard} from '../../superuser.guard'
import {ScheduledTasksPushWorker} from './scheduled-tasks-push.worker'
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
  constructor(
    private readonly taskService: TasksService,
    private readonly dueDateWorker: DueDateWorker,
    private readonly scheduledTasksPushWorker: ScheduledTasksPushWorker
  ) {}

  @Post('hooks/scheduled-tasks-push')
  @UseGuards(SuperUserGuard)
  PushScheduledTasksHook() {
    return this.scheduledTasksPushWorker.RunTask()
  }

  @Post('hook/due-date')
  @UseGuards(SuperUserGuard)
  DueDateHook() {
    return this.dueDateWorker.RunTask()
  }

  @Post()
  @HttpCode(201)
  async Create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskDtoSchema))
    taskDto: CreateTaskDto
  ): Promise<TaskT> {
    const result = await this.taskService.Create(uid, taskDto)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Get()
  FindAll(
    @User() user: UserRecord,
    @Query(FujiPipe.of(tasksQueryFiltersSchema)) query: TasksQueryFiltersT
  ) {
    return this.taskService.FindAllByUID(user.uid, query)
  }

  @Post('clone/:taskId')
  async CloneTask(@User('uid') uid: UID, @Param('taskId') taskId: TaskId) {
    const task = await this.taskService.CloneTask(taskId, uid)()

    if (E.isLeft(task)) {
      throw task.left
    }

    return task.right
  }

  @Get('search')
  Search(@User('uid') uid: UID, @Query('query') query: string) {
    return this.taskService.Search(uid, query)
  }

  @Get(':id')
  async FindOne(@User() user: UserRecord, @Param('id') id: TaskT['id']) {
    const task = await this.taskService.FindOne(id, user.uid)()

    if (E.isLeft(task)) {
      throw task.left
    }

    return task.right
  }

  @Patch(':id')
  async PatchTask(
    @User('uid') uid: UID,
    @Param('id') id: TaskId,
    @Body(FujiPipe.of(taskPatchSchema)) patch: TaskPatchT
  ) {
    const result = await this.taskService.PatchTask(uid, id, patch)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Patch(':id/complete/toggle')
  async ToggleCompleted(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    const task = await this.taskService.ToggleCompleted(taskId, user.uid)()

    if (E.isLeft(task)) {
      throw task.left
    }

    return task.right
  }

  @Patch(':id/important/toggle')
  async ToggleImportant(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    const task = await this.taskService.ToggleImportant(taskId, user.uid)()

    if (E.isLeft(task)) {
      throw task.left
    }

    return task.right
  }

  @Delete(':id')
  async DeleteOne(@User() user: UserRecord, @Param('id') taskId: TaskT['id']) {
    const result = await this.taskService.DeleteOne(taskId, user.uid)()

    if (E.isLeft(result)) {
      throw result.left
    }

    if (!result.right) {
      throw new InternalServerErrorException('failed to delete task')
    }

    return result.right
  }

  @Post(':taskId/tags/:tagId')
  async CreateTaskTag(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    const result = await this.taskService.CreateTag(uid, taskId, tagId)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }

  @Delete(':taskId/tags/:tagId')
  async DeleteTaskTag(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    const result = await this.taskService.DeleteTag(uid, taskId, tagId)()

    if (E.isLeft(result)) {
      throw result.left
    }

    return result.right
  }
}
