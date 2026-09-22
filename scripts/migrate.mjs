import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"

const __dirname = dirname(fileURLToPath(import.meta.url))

const envLocal = join(__dirname, "..", ".env.local")
config({ path: existsSync(envLocal) ? envLocal : join(__dirname, "..", ".env") })

const url = process.env.DATABASE_URL
if (!url) {
	console.error("DATABASE_URL not set in .env")
	process.exit(1)
}

const sql = neon(url)
const drizzleDir = join(__dirname, "..", "drizzle")

const files = readdirSync(drizzleDir)
	.filter((f) => f.endsWith(".sql"))
	.sort()

if (files.length === 0) {
	console.log("No migration files found in drizzle/")
	process.exit(0)
}

for (const file of files) {
	const content = readFileSync(join(drizzleDir, file), "utf-8")
	const statements = content
		.split("--> statement-breakpoint")
		.map((s) => s.trim())
		.filter(Boolean)

	console.log(`\n--- ${file} (${statements.length} statements) ---`)
	for (const stmt of statements) {
		try {
			await sql(stmt)
			console.log("✓ OK")
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			if (msg.includes("already exists")) {
				console.log("↪ skipped (already exists)")
			} else {
				console.error("✗ FAILED:", msg)
				console.error("Statement:", stmt)
				process.exit(1)
			}
		}
	}
}

console.log("\n✓ All migrations applied")
