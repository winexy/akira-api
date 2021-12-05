import {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('tasks', t => {
    t.date('date').defaultTo(null)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('tasks', t => {
    t.dropColumn('date')
  })
}
