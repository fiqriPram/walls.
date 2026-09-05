import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
	console.warn(
		"[db] DATABASE_URL is not set. Favorites features will not work until it is configured.",
	)
}

const sql = neon(databaseUrl ?? "postgresql://placeholder:placeholder@localhost/placeholder")
export const db = drizzle(sql, { schema })
export { schema }
