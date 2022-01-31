import {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('checklist', t => {
    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('checklist', t => {
    t.dropTimestamps()
  })
}
