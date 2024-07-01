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
	// Core Information
	official_id: text('official_id').notNull().primaryKey(),
	name: text('name').notNull(),
	party: text('party'),
	title: text('title').notNull(),

	// Geographical Information
	state: text('state').notNull(),
	district: text('district'),
	county: text('county'),
	city: text('city'),

	// Contact Information
	office_address: text('office_address'),
	phone: text('phone'),
	email: text('email'),
	website: text('website'),

	// Media
	image_url: text('image_url'),
	social_links: jsonb('social_links'),

	// Classification
	level: text('level').notNull(), // 'federal', 'state', 'local'
	branch: text('branch'), // 'executive', 'legislative', 'judicial'
	chamber: text('chamber'), // For legislators: 'senate', 'house', etc.

	// Term Information
	term_start: timestamp('term_start'),
	term_end: timestamp('term_end'),
	term_limit: integer('term_limit'),

	// Additional Details
	biography: text('biography'),
	education: jsonb('education'),
	professional_experience: jsonb('professional_experience'),
	committee_assignments: jsonb('committee_assignments'),

	// Voting and Bill Information
	voting_record_summary: jsonb('voting_record_summary'),
	sponsored_bills: jsonb('sponsored_bills'),

	// Financial Information
	campaign_finance_summary: jsonb('campaign_finance_summary'),
	top_donors: jsonb('top_donors'),

	// Metadata
	last_updated: timestamp('last_updated').notNull(),
	data_source: text('data_source').notNull(),
	is_active: boolean('is_active').notNull().default(true),

	// Additional fields for flexibility
	additional_info: jsonb('additional_info')
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
