import {Knex} from 'knex'

const table = 'shared_tasks'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(table, t => {
    t.increments()
    t.uuid('task_id').notNullable()
    t.string('user_id').notNullable()
    t.integer('access').notNullable()
    t.timestamps(true, true)

    t.foreign('task_id').references('tasks.id')
    t.foreign('user_id').references('users.uid')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(table)
}
