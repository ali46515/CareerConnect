// tests/setup.js
import mongoose from "mongoose";
import { config } from "../src/config/index.js";

beforeAll(async () => {
  // Ensure we use the test DB connection string if provided
  const uri = process.env.MONGODB_URI || config.mongoUri;
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
