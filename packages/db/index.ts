import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });


import { createClient } from "redis";


const redis = createClient({
    url:process.env.REDIS_URL || "redis://localhost:6379"
})

await redis.connect();

export { prisma,redis };