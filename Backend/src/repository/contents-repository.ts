import { db } from "./db";
import { serializeFS } from "../utils/serialize-firestore";
import { firestore } from "firebase-admin"; // admin privileges
import FieldValue = firestore.FieldValue;
import Timestamp = firestore.Timestamp;
import { ContentEntity } from "../entities/content-entity";
import { ContentRes } from "../controllers/content-controller/responses/content-res";
import { ContentsListRes } from "../controllers/content-controller/responses/content-list-res";
import * as firestoreUser from "firebase/firestore"; // user privileges

export class ContentsRepository {
  
  async getContentById(contentId: string): Promise<ContentRes | null> {
    const contentDoc = await db().collection("contents").doc(contentId).get();
    if (!contentDoc.exists) return null;

    const data = contentDoc.data();
    if (!data) return null;

    const likesSnapshot = await contentDoc.ref.collection("likes").get();
    const numberOfLikes = likesSnapshot.size;

    const contentEntity = new ContentEntity(
      data.title,
      data.body,
      data.description,
      data.createdby,
      data.createdate
    );

    return new ContentRes(contentEntity, contentId, numberOfLikes);
  }

  async createContent(
    body: string,
    title: string,
    description: string,
    createdby: string
  ): Promise<ContentRes> {
    const contentsCollection = db().collection("contents");
    const data = new ContentEntity(
      title,
      body,
      description,
      Timestamp.now(),
      createdby
    );

    const docRef = await contentsCollection.add(serializeFS(data));

    return new ContentRes(data, docRef.id, 0);
  }

  async toggleLike(contentId: string, userId: string): Promise<void> {
    const contentDoc = db().collection("contents").doc(contentId);
    const likesCollection = contentDoc.collection("likes");
    const userLikeQuery = await likesCollection.where("userId", "==", userId).get();

    if (!userLikeQuery.empty) {
      await userLikeQuery.docs[0].ref.delete();
    } else {
      const likeData = {
        userId: userId,
        likedAt: Timestamp.now(),
      };
      await likesCollection.add(likeData);
    }
  }

  async deleteFavorite(contentId: string, userId: string): Promise<void> {
    const contentDoc = db().collection("contents").doc(contentId);
    const favoritesCollection = contentDoc.collection("favorites");
    const favoriteQuery = await favoritesCollection.where("userId", "==", userId).get();

    if (!favoriteQuery.empty) {
      await favoriteQuery.docs[0].ref.delete();
    } else {
      console.log(`Favorite by user ${userId} not found for content ${contentId}`);
    }
  }

  async toggleFavorite(contentId: string, userId: string): Promise<void> {
    const contentDoc = db().collection("contents").doc(contentId);
    const favoritesCollection = contentDoc.collection("favorites");
    const userFavoriteQuery = await favoritesCollection.where("userId", "==", userId).get();

    if (!userFavoriteQuery.empty) {
      await userFavoriteQuery.docs[0].ref.delete();
    } else {
      const favoriteData = {
        userId: userId,
        favoritedAt: Timestamp.now(),
      };
      await favoritesCollection.add(favoriteData);
    }
  }

  async getContents(): Promise<ContentsListRes> {
    const contentsRef = db().collection("contents");
    const snapshot = await contentsRef.get();
    const contents: ContentRes[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const likesSnapshot = await doc.ref.collection("likes").get();
      const numberOfLikes = likesSnapshot.size;

      const contentEntity = new ContentEntity(
        data.title,
        data.body,
        data.description,
        data.createdate,
        data.createdby
      );

      contents.push(new ContentRes(contentEntity, doc.id, numberOfLikes));
    }

    return new ContentsListRes(contents);
  }

  async deleteContentById(contentId: string): Promise<void> {
    const dbase = firestoreUser.getFirestore();
    const docRef = firestoreUser.doc(dbase, "contents", contentId);

    try {
      await firestoreUser.deleteDoc(docRef);
      console.log("Entire Document has been deleted successfully.");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateContentById(
    contentId: string,
    title: string,
    body: string,
    description: string
  ): Promise<boolean> {
    const ref = db().collection("contents").doc(contentId);

    await ref.update({
      title,
      body,
      description,
      updatedate: Timestamp.now(),
    });

    const updatedDoc = await ref.get();
    if (!updatedDoc.exists || !updatedDoc.data()) {
      return false;
    }

    return true;
  }

  async createFavorite(contentId: string, userId: string): Promise<void> {
    const contentDoc = db().collection("contents").doc(contentId);
    const favoritesCollection = contentDoc.collection("favorites");
    const existingFavoriteQuery = await favoritesCollection.where("userId", "==", userId).get();

    if (!existingFavoriteQuery.empty) {
      throw new Error("Content already favorited by this user.");
    }

    const favoriteData = {
      userId: userId,
      favoritedAt: Timestamp.now(),
    };

    await favoritesCollection.add(favoriteData);
  }

  async getFavoritedContentsByUserId(userId: string): Promise<ContentsListRes> {
    const contentsCollection = db().collection("contents");
    const allContentsSnapshot = await contentsCollection.get();
    const favoritedContents: ContentRes[] = [];

    for (const doc of allContentsSnapshot.docs) {
      const favoritesSnapshot = await doc.ref.collection("favorites").where("userId", "==", userId).get();

      if (!favoritesSnapshot.empty) {
        const data = doc.data();
        if (data) {
          const likesSnapshot = await doc.ref.collection("likes").get();
          const numberOfLikes = likesSnapshot.size;

          const contentEntity = new ContentEntity(
            data.title,
            data.body,
            data.description,
            data.createdate,
            data.createdby
          );

          favoritedContents.push(new ContentRes(contentEntity, doc.id, numberOfLikes));
        }
      }
    }

    return new ContentsListRes(favoritedContents);
  }

  async getLikedContentsByUserId(userId: string): Promise<ContentsListRes> {
    const contentsCollection = db().collection("contents");
    const allContentsSnapshot = await contentsCollection.get();
    const likedContents: ContentRes[] = [];

    for (const doc of allContentsSnapshot.docs) {
      const likesSnapshot = await doc.ref.collection("likes").where("userId", "==", userId).get();

      if (!likesSnapshot.empty) {
        const data = doc.data();
        if (data) {
          const totalLikesSnapshot = await doc.ref.collection("likes").get();
          const numberOfLikes = totalLikesSnapshot.size;

          const contentEntity = new ContentEntity(
            data.title,
            data.body,
            data.description,
            data.createdate,
            data.createdby
          );

          likedContents.push(new ContentRes(contentEntity, doc.id, numberOfLikes));
        }
      }
    }

    return new ContentsListRes(likedContents);
  }
}

export const contentsRepository = new ContentsRepository();
