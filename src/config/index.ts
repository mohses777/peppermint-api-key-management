import dotenv from "dotenv";
import path from "path";

const envFile = path.resolve(
  `env/${process.env.NODE_ENV || "development"}.env`
);
dotenv.config({ path: envFile });

const config = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },
  db: {
    uri: process.env.DB_URI || "mongodb://localhost:27017/vivify_db",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret",
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
  },
  apiKey: {
    maxActiveKeys: Number(process.env.MAX_ACTIVE_API_KEYS) || 3,
  }

};

export default config;
