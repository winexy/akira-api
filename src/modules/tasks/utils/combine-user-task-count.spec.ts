import {combineUserTaskCount} from './combine-user-task-count'
import {UserTaskCountMeta} from '../tasks.repository'

const USER_ID = 'user-id'
const DEFAULT_USER_TASK_COUNT: UserTaskCountMeta = {
  user_id: USER_ID,
  tasks_count: '1'
}

describe('combineUserTaskCount', () => {
  it('should combine', () => {
    const meta1: Array<UserTaskCountMeta> = [DEFAULT_USER_TASK_COUNT]
    const meta2: Array<UserTaskCountMeta> = [DEFAULT_USER_TASK_COUNT]

    const result = combineUserTaskCount(meta1)(meta2)

    expect(result).toEqual({
      [USER_ID]: 2
    })
  })

  it.each`
    meta1                        | meta2
    ${[DEFAULT_USER_TASK_COUNT]} | ${[]}
    ${[]}                        | ${[DEFAULT_USER_TASK_COUNT]}
  `(
    'should not lost data if one of the meta arrays does not contain one',
    ({meta1, meta2}) => {
      const result = combineUserTaskCount(meta1)(meta2)

      expect(result).toEqual({
        [USER_ID]: 1
      })
    }
  )
})
