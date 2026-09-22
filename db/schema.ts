import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core"

export const users = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
)

export const accounts = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		password: text("password"),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("account_provider_account_uidx").on(table.providerId, table.accountId),
		index("account_userId_idx").on(table.userId),
	],
)

export const verifications = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const wallpapers = pgTable(
	"wallpapers",
	{
		id: serial("id").primaryKey(),
		externalId: text("external_id").notNull(),
		title: text("title").notNull(),
		author: text("author").notNull(),
		category: text("category").notNull().default("all"),
		thumbUrl: text("thumb_url").notNull(),
		fullUrl: text("full_url").notNull(),
		downloadUrl: text("download_url").notNull(),
		width: integer("width").notNull(),
		height: integer("height").notNull(),
		tags: text("tags").array().default([]),
		description: text("description"),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		uniqueWallpaper: uniqueIndex("unique_wallpaper_idx").on(table.externalId),
	}),
)

export const favorites = pgTable(
	"favorites",
	{
		id: serial("id").primaryKey(),
		externalId: text("external_id").notNull(),
		source: text("source").notNull(),
		title: text("title").notNull(),
		author: text("author").notNull(),
		thumbUrl: text("thumb_url").notNull(),
		fullUrl: text("full_url").notNull(),
		downloadUrl: text("download_url").notNull(),
		width: integer("width").notNull(),
		height: integer("height").notNull(),
		deviceId: text("device_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		uniqueFav: uniqueIndex("unique_fav_idx").on(table.deviceId, table.source, table.externalId),
	}),
)

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Account = typeof accounts.$inferSelect
export type Wallpaper = typeof wallpapers.$inferSelect
export type NewWallpaper = typeof wallpapers.$inferInsert
export type Favorite = typeof favorites.$inferSelect
export type NewFavorite = typeof favorites.$inferInsert
