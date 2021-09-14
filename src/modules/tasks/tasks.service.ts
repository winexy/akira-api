import {Inject, Injectable, forwardRef} from '@nestjs/common'
import {TasksRepo} from './tasks.repository'
import {
  TaskIdT,
  TaskPatchT,
  TaskT,
  CreateTaskDto,
  TasksQueryFiltersT
} from './task.model'
import {Tag} from '../tags/tag.model'
import {TasksTagsRepo} from './tasks-tags.repository'
import {TaskTag} from './tasks-tags.model'
import {MyDayService} from '../myday/myday.service'
import {UserError} from '../../filters/user-error.exception.filter'
import {TaskSchedulerService} from '../task-scheduler/task-scheduler.service'
import {format} from 'date-fns'

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepo: TasksRepo,
    private readonly taskTagsRepo: TasksTagsRepo,
    @Inject(forwardRef(() => MyDayService))
    private readonly myDateService: MyDayService,
    private readonly taskSchedulerService: TaskSchedulerService
  ) {}

  async createForMyDay(
    uid: UID,
    taskDto: CreateTaskDto
  ): EitherP<DBException | UserError, TaskT> {
    const taskId = await this.tasksRepo.create(uid, taskDto)

    const listId = taskDto.meta?.list_id

    if (listId) {
      this.tasksRepo.addToList(taskId, uid, listId)
    }

    const result = await this.taskSchedulerService.create(uid, {
      date: format(new Date(), 'yyyy-MM-dd'),
      task_id: taskId
    })

    return result.asyncChain(() => this.tasksRepo.findOne(taskId, uid))
  }

  async create(uid: UID, taskDto: CreateTaskDto) {
    const taskId = await this.tasksRepo.create(uid, taskDto)
    return this.tasksRepo.findOne(taskId, uid)
  }

  findAllByUID(uid: UID, query: TasksQueryFiltersT) {
    return this.tasksRepo.findAllByUID(uid, query)
  }

  findOne(taskId: TaskIdT, uid: UID) {
    return this.tasksRepo.findOne(taskId, uid)
  }

  search(uid: UID, query: string) {
    return this.tasksRepo.search(uid, query)
  }

  async toggleCompleted(taskId: TaskIdT, uid: UID) {
    const result = await this.findOne(taskId, uid)

    return result.asyncChain(task =>
      this.tasksRepo.update(taskId, uid, {
        is_completed: !task.is_completed
      })
    )
  }

  async toggleImportant(taskId: TaskIdT, uid: UID) {
    const result = await this.findOne(taskId, uid)

    return result.asyncChain(task =>
      this.tasksRepo.update(taskId, uid, {
        is_important: !task.is_important
      })
    )
  }

  deleteOne(taskId: TaskIdT, uid: UID) {
    return this.tasksRepo.deleteOne(taskId, uid)
  }

  async ensureAuthority(taskId: TaskIdT, uid: UID): EitherP<DBException, true> {
    const res = await this.findOne(taskId, uid)
    return res.map(() => true)
  }

  patchTask(
    uid: UID,
    taskId: TaskIdT,
    patch: TaskPatchT
  ): EitherP<DBException, TaskT> {
    return this.tasksRepo.update(taskId, uid, patch)
  }

  async createTag(
    uid: UID,
    taskId: TaskIdT,
    tagId: Tag['id']
  ): EitherP<DBException, TaskTag> {
    const isAuthor = await this.ensureAuthority(taskId, uid)

    return isAuthor.asyncMap(() => {
      return this.taskTagsRepo.createTaskTag(taskId, tagId)
    })
  }

  async deleteTag(
    uid: UID,
    taskId: TaskIdT,
    tagId: Tag['id']
  ): EitherP<DBException, number> {
    const isAuthor = await this.ensureAuthority(taskId, uid)

    return isAuthor.asyncChain(() => {
      return this.taskTagsRepo.deleteTaskTag(taskId, tagId)
    })
  }

  async findByUpdatedAtDate(uid: UID, date: string) {
    return this.tasksRepo.findByUpdatedDate(uid, date)
  }
}
