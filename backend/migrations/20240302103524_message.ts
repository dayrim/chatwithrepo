import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Ensure the UUID extension is enabled (PostgreSQL)
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  await knex.schema.createTable('messages', (table) => {
    // Use UUID for the primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))

    // Add message text content column, assuming potentially long texts, in camelCase
    table.text('text') // Changed to camelCase

    // Add a userId column to link to the users table, already in camelCase
    table.uuid('userId').nullable().references('id').inTable('users').onDelete('CASCADE')

    // Manually add timestamps in camelCase
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('messages')
}
