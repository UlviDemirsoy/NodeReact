import express, { Express } from "express";
import { interceptors } from "./interceptors";
import { log } from "./utils/logger";
import bodyParser from "body-parser";
import * as admin from "firebase-admin";
import { HttpServer } from "./controllers";
import { CONTROLLERS } from "./controllers/controllers";
import { initializeApp } from "firebase/app";
import cors from "cors";
import config from "./config";
console.log("config>")
console.log(config);

if (!config?.FIREBASE_ADMIN?.project_id?.length) {
  throw Error(
    'Missing Firebase Admin Credentials.'
  );
}
if (!config?.FIREBASE?.projectId?.length) {
  throw Error(
    'Missing Firebase Credentials.'
  );
}

//user
initializeApp(config?.FIREBASE);
//admin
admin.initializeApp({
  credential: admin.credential.cert(
    config.FIREBASE_ADMIN as any
  ),
  projectId: config.FIREBASE_ADMIN.project_id,
  databaseURL: `https://${
      config.FIREBASE_ADMIN.project_id ?? ""
  }.firebaseio.com`,
});

const app: Express = express();
const httpServer = new HttpServer(app);
const port = config.PORT || 3001;
const frontend_url = config?.FRONTEND_URL || "http://localhost:3000";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ credentials: true, origin: frontend_url }));

for (let i = 0; i < interceptors.length; i++) {
  app.use(interceptors[i]);
}

CONTROLLERS.forEach((controller) => {
  controller.initialize(httpServer);
});

app.listen(port, () => {
  log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
