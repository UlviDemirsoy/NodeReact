import {
  Express,
  Request,
  Response,
  IRouterHandler,
  NextFunction,
} from "express";
import { verifyValidFirebaseUidTokenInterceptor } from "./verify-valid-firebase-uid-token-interceptor";

export const interceptors: Array<
  (req: Request, res: Response, next: NextFunction) => void
> = [verifyValidFirebaseUidTokenInterceptor];
