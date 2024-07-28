import { ContentRes } from "./content-res";

export class ContentsListRes {
  constructor(public readonly contents: ContentRes[]) {}
}
