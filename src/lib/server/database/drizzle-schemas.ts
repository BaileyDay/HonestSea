import { pgTable, text, jsonb, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
	id: text('id').notNull().primaryKey(),
	provider: text('provider').notNull().default('email'),
	providerId: text('provider_id').notNull().default(''),
	email: text('email').notNull().unique(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	role: text('role').notNull().default('USER'),
	verified: boolean('verified').notNull().default(false),
	receiveEmail: boolean('receive_email').notNull().default(true),
	password: text('password'),
	token: text('token').unique(),
	createdAt: timestamp('created_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull(),
	updatedAt: timestamp('updated_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const sessionTable = pgTable('sessions', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const officialsTable = pgTable('officials', {
	official_id: text('official_id').primaryKey(),
	name: text('name').notNull(),
	party: text('party'),
	title: text('title').notNull(),
	state: text('state').notNull(),
	level: text('level').notNull(),
	role: text('role').notNull(),
	division_id: text('division_id').notNull(),
	image_url: text('image_url'),
	websites: jsonb('websites'),
	emails: jsonb('emails'),
	phones: jsonb('phones'),
	address: jsonb('address'),
	social_media: jsonb('social_media'),
	last_updated: timestamp('last_updated').notNull(),
	data_source: text('data_source').notNull(),
	is_active: boolean('is_active').notNull()
});

export const geodata = pgTable('geodata', {
	id: uuid('id').defaultRandom().primaryKey(),
	state: text('state').notNull(),
	level: text('level').notNull(), // Add this line to match your database
	district_number: text('district_number'),
	data: jsonb('data').notNull()
});

export type User = typeof userTable.$inferInsert;
export type UpdateUser = Partial<typeof userTable.$inferInsert>;
export type Session = typeof sessionTable.$inferInsert;
