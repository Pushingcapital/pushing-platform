import "server-only";

import { MongoClient, ServerApiVersion } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __pushingCapitalMongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri() {
  return process.env.MONGODB_URI ?? "";
}

function getMongoDbName() {
  return process.env.MONGODB_DB_NAME ?? "";
}

export function hasMongoConfig() {
  return Boolean(getMongoUri() && getMongoDbName());
}

export function getMongoConfigWarnings() {
  const warnings: string[] = [];

  if (!process.env.MONGODB_URI) {
    warnings.push("Set MONGODB_URI to bridge this app to the existing MongoDB vault.");
  }

  if (!process.env.MONGODB_DB_NAME) {
    warnings.push(
      "Set MONGODB_DB_NAME so the control plane knows which database to use.",
    );
  }

  return warnings;
}

async function getMongoClientPromise() {
  if (!hasMongoConfig()) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI and MONGODB_DB_NAME first.",
    );
  }

  if (!global.__pushingCapitalMongoClientPromise) {
    const client = new MongoClient(getMongoUri(), {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    global.__pushingCapitalMongoClientPromise = client.connect();
  }

  return global.__pushingCapitalMongoClientPromise;
}

export async function getMongoClient() {
  return getMongoClientPromise();
}

export async function getMongoDb() {
  const client = await getMongoClientPromise();
  return client.db(getMongoDbName());
}
