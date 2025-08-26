import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. Please set it in your environment or .env file.",
  );
}

export const createDatabaseClient = () => {
  return new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

export const connectToDatabase = async () => {
  const client = createDatabaseClient();
  await client.connect();
  return client;
};
