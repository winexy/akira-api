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
import {doTask} from 'src/shared/do-task'

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
  Create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(createTaskDtoSchema))
    taskDto: CreateTaskDto
  ): Promise<TaskT> {
    return doTask(this.taskService.Create(uid, taskDto))
  }

  @Get()
  FindAll(
    @User() user: UserRecord,
    @Query(FujiPipe.of(tasksQueryFiltersSchema)) query: TasksQueryFiltersT
  ) {
    return this.taskService.FindAllByUID(user.uid, query)
  }

  @Post('clone/:taskId')
  CloneTask(@User('uid') uid: UID, @Param('taskId') taskId: TaskId) {
    return doTask(this.taskService.CloneTask(taskId, uid))
  }

  @Get('search')
  Search(@User('uid') uid: UID, @Query('query') query: string) {
    return this.taskService.Search(uid, query)
  }

  @Get(':id')
  async FindOne(@User() user: UserRecord, @Param('id') id: TaskT['id']) {
    return doTask(this.taskService.FindOne(id, user.uid))
  }

  @Patch(':id')
  PatchTask(
    @User('uid') uid: UID,
    @Param('id') id: TaskId,
    @Body(FujiPipe.of(taskPatchSchema)) patch: TaskPatchT
  ) {
    return doTask(this.taskService.PatchTask(uid, id, patch))
  }

  @Patch(':id/complete/toggle')
  async ToggleCompleted(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    return doTask(this.taskService.ToggleCompleted(taskId, user.uid))
  }

  @Patch(':id/important/toggle')
  ToggleImportant(@User() user: UserRecord, @Param('id') taskId: TaskT['id']) {
    return doTask(this.taskService.ToggleImportant(taskId, user.uid))
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
  CreateTaskTag(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    return doTask(this.taskService.CreateTag(uid, taskId, tagId))
  }

  @Delete(':taskId/tags/:tagId')
  DeleteTaskTag(
    @User('uid') uid: UID,
    @Param('taskId') taskId: TaskId,
    @Param('tagId', ParseIntPipe) tagId: Tag['id']
  ) {
    return doTask(this.taskService.DeleteTag(uid, taskId, tagId))
  }
}
