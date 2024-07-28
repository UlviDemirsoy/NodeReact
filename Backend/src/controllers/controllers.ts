import { RootController } from "./root-controller";
import { Controller } from "./index";
import { ContentController } from "./content-controller/content-controller";
import { AccountController } from "./account-controller/account-controller";

export const CONTROLLERS: Array<Controller> = [
  new RootController(),
  new AccountController(),
  new ContentController(),
];
