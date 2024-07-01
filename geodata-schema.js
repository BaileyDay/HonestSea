// src/db/schema.ts
import { pgTable, uuid, text, jsonb } from 'drizzle-orm/pg-core';

export const geodata = pgTable('geodata', {
	id: uuid('id').defaultRandom().primaryKey(),
	state: text('state').notNull(),
	level: text('level').notNull(), // Add this line to match your database
	district_number: text('district_number'),
	data: jsonb('data').notNull()
});
