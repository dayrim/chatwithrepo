import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    // Use UUID for the ID column
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    // Keep the existing columns
    table.string('email').unique()
    table.string('password')
    table.string('githubId')

    // Add a 'name' column
    table.string('name')

    // Add timestamps
    table.timestamps(true, true)
  })

  // Ensure the UUID extension is enabled (PostgreSQL)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
