import {Model} from 'objection'

export type TaskTag = {
  id: number
  task_id: string
  tag_id: number
}

export class TasksTagsModel extends Model implements TaskTag {
  id: number
  task_id: string
  tag_id: number

  static tableName = 'task_tags'
}
