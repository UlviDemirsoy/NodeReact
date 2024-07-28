import { Controller, HttpServer } from "../index";
import { RequestHandler } from "express";
import { CreateAccountReqBody } from "./requests/create-account/create-account-req-body";
import { UpdateAccountReqBody } from "./requests/update-account/update-account-req-body";
import { CreateAccountResBody } from "./responses/create-account-res-body";
import { checkIfIsValidCreateAccountReqBody } from "./requests/create-account/create-account-validation";
import { accountsService } from "../../services/accounts-service";
import { LoginAccountReqBody } from "./requests/login-account/login-account-req-body";
import { RefreshTokenReqBody } from "./requests/refresh/refresh-req-body";
import { RefreshTokenResBody } from "./responses/RefreshTokenResBod";

export class AccountController implements Controller {
  initialize(httpServer: HttpServer): void {
    httpServer.post("/account", this.createAccount.bind(this));
    httpServer.post("/account/login", this.signInEmailPassword.bind(this));
    httpServer.put("/account/password", this.updatePassword.bind(this));
    httpServer.get("/account/refresh", this.refreshToken.bind(this));
    httpServer.post("/account/logout", this.logout.bind(this)); 
  }

  private readonly createAccount: RequestHandler = async (req, res, next) => {
    const body: CreateAccountReqBody = Object.assign({}, req.body);
    checkIfIsValidCreateAccountReqBody(body);
    const createdUser = await accountsService.createAccount(
      body.name,
      body.email,
      body.password
    );
    res.send(new CreateAccountResBody(createdUser));
    next();
  };

  private readonly logout: RequestHandler = async (
    req,
    res,
    next
  ) => {
    console.log("logout");
    try {
      await accountsService.signOut();
      res.clearCookie('refreshToken');
      res.send({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: "Logout failed" });
    }
    next();
  };

  private readonly signInEmailPassword: RequestHandler = async (
    req,
    res,
    next
  ) => {
    const body: LoginAccountReqBody = Object.assign({}, req.body);
    try {
      const signIn = await accountsService.signInWithEmailPassword(
        body.email,
        body.password
      );
  
      const { user } = signIn;
      const idToken = await user.getIdToken();
      const refreshToken = user.refreshToken;
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, 
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });
  
      res.send(signIn);
    } catch (e) {
      console.error(e);
      res.status(401).send({ error: "Authentication failed" });
    }
    next();
  };
  

  private readonly updatePassword: RequestHandler = async (
    req,
    res,
    next
  ) => {
    const body: UpdateAccountReqBody = Object.assign({}, req.body);
    const isUpdated = await accountsService.updatePassword(
      body.password
    );
    res.send(new Boolean(isUpdated));
    next();
  };

  private readonly refreshToken: RequestHandler = async (
    req,
    res,
    next
  ) => {
    const body: RefreshTokenReqBody = Object.assign({}, req.body);
    const newToken = await accountsService.refreshToken(
      body.refreshToken
    );
    res.send(new RefreshTokenResBody(newToken));
    next();
  };
}
