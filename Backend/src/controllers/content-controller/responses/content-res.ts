import { firestore } from "firebase-admin";
import Timestamp = firestore.Timestamp;
import { ContentEntity } from "../../../entities/content-entity";

export class ContentRes {
  public readonly Id: string;
  public readonly title: string;
  public readonly body: string;
  public readonly likeCount: number | null;
  public readonly description: string;
  public readonly createdby: string;
  public readonly createdate: Timestamp;
  constructor(data: ContentEntity, id: string, likeCount: number | null) {
    this.Id = id;
    this.createdate = data.createdate;
    this.description = data.description;
    this.createdby = data.createdby;
    this.title = data.title;
    this.likeCount = likeCount;
    this.body = data.body;
  }

  static empty() {
    return new ContentRes(
      new ContentEntity("", "" , "", Timestamp.now(),""),
      "", null
    );
  }
}
