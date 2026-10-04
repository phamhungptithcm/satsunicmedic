import { writeFile } from 'node:fs/promises';
import { SwaggerModule,DocumentBuilder } from '@nestjs/swagger';
import { createApp } from './app.js';
import { readConfig } from './config.js';
const app=await createApp(readConfig({NODE_ENV:'test',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8189',FIREBASE_PROJECT_ID:'demo-humanscope'}));
await app.init();
const document=SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('HumanScope REST API').setVersion('1').setDescription('Foundation route inventory. Body validation is defined by Zod contracts; response schemas and full OpenAPI coverage remain a release gate.').addCookieAuth('hs_session').build());
await writeFile('../../docs/implementation/openapi.json',JSON.stringify(document,null,2)+'\n');
await app.close();
