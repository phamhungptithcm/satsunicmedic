import "reflect-metadata";
import { Module, type DynamicModule } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { json } from "express";
import { CONFIG, type Config } from "./config.js";
import { Database } from "./database.js";
import { Identity, AuthController, SessionGuard } from "./identity.js";
import { CsrfGuard, trafficLimit } from "./security.js";
import { PublicController } from "./public.js";
import { PrivateController } from "./private.js";
import { EditorController } from "./editor.js";
import { LearningController } from "./learning.js";
import {ClassroomController} from './classroom.js';
import { FacilityController } from "./facilities.js";
import { AccountController } from "./account.js";
import { AccountExportController } from "./account-export.js";
import { ContributionsController } from "./contributions.js";
import { SafeErrors } from "./errors.js";
@Module({})
class AppModule {
  static configure(config: Config): DynamicModule {
    return {
      module: AppModule,
      controllers: [
        AuthController,
        AccountController,
        AccountExportController,
        ContributionsController,
        PublicController,
        PrivateController,
        EditorController,
        LearningController,
        FacilityController,
        ClassroomController,
      ],
      providers: [
        { provide: CONFIG, useValue: config },
        Database,
        Identity,
        SessionGuard,
        CsrfGuard,
      ],
    };
  }
}
export async function createApp(config: Config) {
  const app = await NestFactory.create(AppModule.configure(config), {
    logger: ["error", "warn"],
    bodyParser: false,
  });
  app.use(helmet());
  app.use(json({ limit: "256kb" }));
  app.use(cookieParser());
  app.use(trafficLimit());
  app.use(
    (
      _req: unknown,
      res: { setHeader: (k: string, v: string) => void },
      next: () => void,
    ) => {
      res.setHeader("Cache-Control", "private, no-store");
      next();
    },
  );
  app.useGlobalFilters(new SafeErrors());
  app.enableShutdownHooks();
  if (config.NODE_ENV !== "production") {
    const spec = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("HumanScope API")
        .setVersion("1")
        .addCookieAuth("hs_session")
        .build(),
    );
    SwaggerModule.setup("api/docs", app, spec);
  }
  return app;
}
