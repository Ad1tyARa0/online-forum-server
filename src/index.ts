import connectRedis from "connect-redis";
// import { pgConfig } from "./ormconfig";
import express from "express";
import Redis from "ioredis";
import session from "express-session";
import { createConnection } from "typeorm";
import bodyParser from "body-parser";
import { login, logout, register } from "./repo/UserRepo";
import { createThread } from "./repo/ThreadRepo";
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

  app.use(bodyParser.json());

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
    req.session!.test = "hello";
    res.send("hello");
  });

  router.post("/register", async (req: any, res, next) => {
    try {
      console.log("params", req.body);

      const userResult = await register(
        req.body.email,
        req.body.userName,
        req.body.password
      );

      if (userResult && userResult.user) {
        res.send(`New user created!, userId: ${userResult.user.Id}`);
      } else if (userResult && userResult.messages) {
        res.send(userResult.messages[0]);
      } else {
        next();
      }
    } catch (error) {
      res.send(error.message);
    }
  });

  router.post("/login", async (req: any, res, next) => {
    try {
      console.log("params", req.body);

      const userResult = await login(req.body.userName, req.body.password);

      if (userResult && userResult.user) {
        req.session!.userId = userResult.user.Id;

        res.send(`user logged in, userId: ${req.session!.userId}`);
      } else if (userResult && userResult.messages) {
        res.send(userResult.messages[0]);
      } else {
        next();
      }
    } catch (error) {
      res.send(error.message);
    }
  });

  router.post("/logout", async (req: any, res, next) => {
    try {
      console.log("params", req.body);

      const msg = await logout(req.body.userName);

      if (msg) {
        req.session!.userId = null;
        res.send(msg);
      } else {
        next();
      }
    } catch (ex) {
      console.log(ex);
      res.send(ex.message);
    }
  });

  router.post("/createthread", async (req: any, res, next) => {
    try {
      console.log("userid", req.session);

      console.log("body", req.body);

      const msg = await createThread(
        req.session!.userId,
        req.body.categoryId,
        req.body.title,
        req.body.body
      );

      res.send(msg);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  });

  app.listen({ port: process.env.SERVER_PORT }, () => {
    console.log(`Server ready on port ${process.env.SERVER_PORT}`);
  });
};

main();
