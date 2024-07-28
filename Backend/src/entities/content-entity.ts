
import { firestore } from "firebase-admin";
import Timestamp = firestore.Timestamp;

export class ContentEntity {
  constructor(
    public readonly title: string,
    public readonly body: string,
    public readonly description: string,
    public readonly createdate: Timestamp,
    public readonly createdby: string,
  ) {}

  static empty() {
    return new ContentEntity("", "", "", Timestamp.now(),"");
  }
}
