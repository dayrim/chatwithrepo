import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Ensure the UUID extension is enabled (PostgreSQL)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  await knex.schema.createTable('users', (table) => {
    // Use UUID for the ID column
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    // Make the existing columns nullable
    table.string('email').unique().nullable()
    table.string('password').nullable()
    table.string('githubId').nullable()
    table.string('geminiApiKey').nullable()

    // Add a 'name' column, also nullable
    table.string('name').nullable()

    // Manually add timestamps in camelCase
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
