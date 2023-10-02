import connectRedis from "connect-redis";
// import { pgConfig } from "./ormconfig";
import express from "express";
import Redis from "ioredis";
import session from "express-session";
import { createConnection } from "typeorm";
// import { DataSource } from "typeorm";
// import { User } from "./repo/User";

require("dotenv").config();

// const pgConfig = [
//   {
//     type: "postgres",
//     host: process.env.PG_HOST,
//     port: process.env.PG_PORT,
//     username: process.env.PG_ACCOUNT,
//     password: process.env.PG_PASSWORD,
//     database: process.env.PG_DATABASE,
//     synchronize: process.env.PG_SYNCHRONIZE,
//     logging: process.env.PG_LOGGING,
//     entities: [process.env.PG_ENTITIES],
//     cli: {
//       entitiesDir: process.env.PG_ENTITIES_DIR,
//     },
//   },
// ];

const main = async () => {
  const app = express();
  const router = express.Router();

  // const AppDataSource = new DataSource(pgConfig as any);

  // const response = await AppDataSource.initialize();

  // .then(() => {
  //   console.log("Data Source has been initialized!");
  // })
  // .catch(err => {
  //   console.error("Error during Data Source initialization", err);
  // });

  const response = await createConnection();
  console.log(response);

  const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  });

  // const RedisStore = require("connect-redis").default;
  const RedisStore = connectRedis(session);

  const redisStore = new RedisStore({
    client: redis,
  });

  app.use(
    session({
      store: redisStore,
      name: process.env.COOKIE_NAME,
      sameSite: "Strict",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 + 24,
      },
    } as any)
  );

  app.use(router);
  router.get("/", (req: any, res, next) => {
    if (!req.session!.userid) {
      req.session!.userid = req.query.userid;
      console.log("user id is set");
      req.session!.loadedCount = 0;
    } else {
      req.session!.loadedCount = Number(req.session!.loadedCount) + 1;
    }

    res.send(
      `userid: ${req.session!.userid}, loadedCount: ${req.session!.loadedCount}`
    );
  });

  app.listen({ port: process.env.SERVER_PORT }, () => {
    console.log(`Server ready on port ${process.env.SERVER_PORT}`);
  });
};

main();
