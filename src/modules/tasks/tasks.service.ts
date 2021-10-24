import {Injectable} from '@nestjs/common'
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
import {TaskSchedulerService} from '../task-scheduler/task-scheduler.service'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import {RejectedQueryError} from 'src/shared/transform-reject-reason'

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepo: TasksRepo,
    private readonly taskTagsRepo: TasksTagsRepo,
    private readonly taskSchedulerService: TaskSchedulerService
  ) {}

  create(uid: UID, taskDto: CreateTaskDto) {
    return pipe(
      this.tasksRepo.create(uid, taskDto),
      TE.chain(this.tasksRepo.findOne(uid))
    )
  }

  findAllByUID(uid: UID, query: TasksQueryFiltersT) {
    return this.tasksRepo.findAllByUID(uid, query)
  }

  findOne(taskId: TaskIdT, uid: UID) {
    return this.tasksRepo.findOne(uid)(taskId)
  }

  search(uid: UID, query: string) {
    return this.tasksRepo.search(uid, query)
  }

  toggleCompleted(taskId: TaskIdT, uid: UID) {
    return pipe(
      this.findOne(taskId, uid),
      TE.chain(task => {
        return this.tasksRepo.update(taskId, uid, {
          is_completed: !task.is_completed
        })
      })
    )
  }

  toggleImportant(taskId: TaskIdT, uid: UID) {
    return pipe(
      this.findOne(taskId, uid),
      TE.chain(task => {
        return this.tasksRepo.update(taskId, uid, {
          is_important: !task.is_important
        })
      })
    )
  }

  deleteOne(
    taskId: TaskIdT,
    uid: UID
  ): TE.TaskEither<RejectedQueryError, boolean> {
    return this.tasksRepo.deleteOne(taskId, uid)
  }

  ensureAuthority(taskId: TaskIdT, uid: UID): TE.TaskEither<DBException, true> {
    return pipe(
      this.findOne(taskId, uid),
      TE.map(() => true)
    )
  }

  patchTask(
    uid: UID,
    taskId: TaskIdT,
    patch: TaskPatchT
  ): TE.TaskEither<DBException, TaskT> {
    return this.tasksRepo.update(taskId, uid, patch)
  }

  createTag(
    uid: UID,
    taskId: TaskIdT,
    tagId: Tag['id']
  ): TE.TaskEither<DBException, TaskTag> {
    return pipe(
      this.ensureAuthority(taskId, uid),
      TE.chain(() => this.taskTagsRepo.createTaskTag(taskId, tagId))
    )
  }

  deleteTag(
    uid: UID,
    taskId: TaskIdT,
    tagId: Tag['id']
  ): TE.TaskEither<DBException, number> {
    return pipe(
      this.ensureAuthority(taskId, uid),
      TE.chain(() => this.taskTagsRepo.deleteTaskTag(taskId, tagId))
    )
  }

  async findByUpdatedAtDate(uid: UID, date: string) {
    return this.tasksRepo.findByUpdatedDate(uid, date)
  }
}
