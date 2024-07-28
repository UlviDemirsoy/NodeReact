import {auth} from "firebase-admin";
import UserRecord = auth.UserRecord;

export class CreateAccountResBody {
    public readonly status;
    public readonly uid;
   
    constructor(
        user:UserRecord
    ) {
        this.uid = user.uid;
        this.status = 'USER_CREATED_SUCCESSFULLY';
    }

}