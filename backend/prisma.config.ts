import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/mkprinting?schema=public",
  },
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
})
