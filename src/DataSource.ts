import { DataSource } from "typeorm";
import { database } from "./config/config.json";
import { Guild } from "./entities/Guild";
import { Roll } from "./entities/Roll";
import { User } from "./entities/User";

const createDbConfig = () => {
  const { host, username, password, db, port } = database;

  const dataSource = new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database: db,
    entities: [User, Guild, Roll],
    migrations: ["./migrations/**/*.js"],
    synchronize: process.env.NODE_ENV === "development",
    logging: true,
    maxQueryExecutionTime: 1000,
    logger: "file",
  });

  return dataSource;
};

export const dbConfig = createDbConfig();
