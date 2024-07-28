import { UserRecord } from "firebase-admin/lib/auth";
import * as admin from "firebase-admin";
import { HttpResponseError } from "../utils/http-response-error";
import {
  getAuth,
  signOut,
  updateCurrentUser,
  updatePassword,
  deleteUser,
  getIdToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  User,
} from "firebase/auth";

class AccountsService {
 
  async createAccount(
    name: string,
    email: string,
    password: string
  ): Promise<UserRecord> {
    try {
      const createUserRes = await admin.auth().createUser({
        displayName: name,
        email: email,
        password: password,
      });
      return admin.auth().getUser(createUserRes.uid);
    } catch (e) {
      if (e.code === "auth/email-already-exists") {
        throw new HttpResponseError(400, "EXISTING_EMAIL", "Email is already in use");
      }
      throw e;
    }
  }

  async signInWithEmailPassword(email: string, password: string): Promise<UserCredential> {
    try {
      const auth = getAuth();
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      throw e;
    }
  }

  async signOut(): Promise<boolean> {
    const auth = getAuth();
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(password: string): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently authenticated.");
    }
    try {
      await updatePassword(user, password);
      console.log("Password updated successfully for user", user);
      return true;
    } catch (e) {
      console.error("Error updating password:", e);
      throw e;
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(refreshToken, true);
      const uid = decodedToken.uid;
      return await admin.auth().createCustomToken(uid);
    } catch (e) {
      throw new HttpResponseError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
    }
  }

  async getCurrentUser(): Promise<User> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new HttpResponseError(401, "NO_USER", "No user is currently authenticated.");
    }
    return user;
  }
}

export const accountsService = new AccountsService();