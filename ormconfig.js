require("dotenv").config();

const {
  PG_HOST,
  PG_PORT,
  PG_ACCOUNT,
  PG_PASSWORD,
  PG_DATABASE,
  PG_SYNCHRONIZE,
  PG_LOGGING,
  PG_ENTITIES,
  PG_ENTITIES_DIR,
} = process.env;

module.exports = [
  {
    type: "postgres",
    host: PG_HOST,
    port: PG_PORT,
    username: PG_ACCOUNT,
    password: PG_PASSWORD,
    database: PG_DATABASE,
    synchronize: PG_SYNCHRONIZE,
    logging: PG_LOGGING,
    entities: [PG_ENTITIES],
    cli: {
      entitiesDir: PG_ENTITIES_DIR,
    },
  },
];
