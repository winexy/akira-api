import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  const data = await knex('scheduled_tasks').select('*')

  for await (const d of data) {
    const task = await knex('tasks').where('id', d.task_id)

    if (task) {
      await knex('tasks').update({date: d.date}).where('id', d.task_id)
    }
  }
}

export async function down(knex: Knex): Promise<void> {}
