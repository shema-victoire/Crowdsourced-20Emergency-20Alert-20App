import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3UoY8bmxfOwH@ep-nameless-cloud-ae7iaums-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

export const createDatabaseClient = () => {
  return new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
};

export const connectToDatabase = async () => {
  const client = createDatabaseClient();
  await client.connect();
  return client;
};
