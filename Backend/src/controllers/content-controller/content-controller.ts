import { Controller, HttpServer } from "../index";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { contentsRepository } from "../../repository/contents-repository";
import { CreateContentReqBody } from "./requests/create-content-req-body";
import { accountsService } from "../../services/accounts-service";


export class ContentController implements Controller {
  initialize(httpServer: HttpServer): void {
    httpServer.post("/content", this.createContent.bind(this));
    httpServer.get("/content/:id", this.getContentById.bind(this));
    httpServer.get("/contents", this.getContents.bind(this));
    httpServer.put("/content/:id", this.updateContentById.bind(this));
    httpServer.delete("/content/:id", this.deleteContentById.bind(this));
    httpServer.get("/contents/favorited", this.getFavorites.bind(this));
    httpServer.get("/contents/liked", this.getLikedContents.bind(this));
    httpServer.post("/content/:id/togglelike", this.toggleLike.bind(this));
    httpServer.post("/content/:id/togglefavorite", this.toggleFavorite.bind(this));
  }

  private readonly createContent: RequestHandler = async (req, res, next) => {
    try {
      const reqBody: CreateContentReqBody = Object.assign({}, req.body);
      const user = await accountsService.getCurrentUser(); 

      const content = await contentsRepository.createContent(
        reqBody.title,
        reqBody.body,
        reqBody.description,
        user.uid
      );
      res.send(content);
      next();
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };

  private readonly toggleLike: RequestHandler = async (req, res, next) => {
    try {
      const contentId = req.params.id;
      if (!contentId) {
        return res.status(400).json({ error: "Content ID is required." });
      }

      const user = await accountsService.getCurrentUser(); 
      console.log("toggle like repo started", contentId, user.uid);
      await contentsRepository.toggleLike(contentId, user.uid);

      res.status(200).json({ message: "Like toggled successfully." });
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while toggling the like." });
    }
  };

  private readonly getContentById: RequestHandler = async (req, res, next) => {
    try {
      const contentId = req.params.id;
      const content = await contentsRepository.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ error: "Content not found." });
      }
      res.send(content);
      next();
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching the content." });
    }
  };

  private readonly getContents: RequestHandler = async (req, res, next) => {
    try {
      const contents = await contentsRepository.getContents();
      res.send(contents);
      next();
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching contents." });
    }
  };

  private readonly updateContentById: RequestHandler = async (req, res, next) => {
    try {
      const contentId = req.params.id;
      const reqBody: CreateContentReqBody = Object.assign({}, req.body);

      const success = await contentsRepository.updateContentById(
        contentId,
        reqBody.title,
        reqBody.body,
        reqBody.description
      );
      if (!success) {
        return res.status(404).json({ error: "Content not found or update failed." });
      }

      res.status(200).json({ message: "Content updated successfully." });
      next();
    } catch (error) {
      res.status(500).json({ error: "An error occurred while updating the content." });
    }
  };

  private readonly deleteContentById: RequestHandler = async (req, res, next) => {
    try {
      const contentId = req.params.id;
      await contentsRepository.deleteContentById(contentId);
      res.status(200).json({ message: "Content deleted successfully." });
      next();
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  private readonly toggleFavorite: RequestHandler = async (req, res, next) => {
    try {
      const contentId = req.params.id;
      if (!contentId) {
        return res.status(400).json({ error: "Content ID is required." });
      }

      const user = await accountsService.getCurrentUser();
      await contentsRepository.toggleFavorite(contentId, user.uid);

      res.status(200).json({ message: "Favorite toggled successfully." });
      next();
    } catch (error) {
      if (error.message === "Content already favorited by this user.") {
        return res.status(400).json({ error: "Content is already favorited." });
      }
      console.error(error);
      res.status(500).json({ error: "An error occurred while toggling the favorite." });
    }
  };

  private readonly getFavorites: RequestHandler = async (req, res, next) => {
    try {
      const user = await accountsService.getCurrentUser();
      const favorites = await contentsRepository.getFavoritedContentsByUserId(user.uid);
      res.status(200).json(favorites);
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching favorites." });
    }
  };

  private readonly getLikedContents: RequestHandler = async (req, res, next) => {
    try {
      const user = await accountsService.getCurrentUser(); 
      const likedContents = await contentsRepository.getLikedContentsByUserId(user.uid);
      res.status(200).json(likedContents);
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching liked contents." });
    }
  };
}
