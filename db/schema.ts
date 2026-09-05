import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

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

export type Favorite = typeof favorites.$inferSelect
export type NewFavorite = typeof favorites.$inferInsert
