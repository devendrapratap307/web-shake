import { Audit } from "./audit";
import { User } from "./user";
export class ChatRoom extends Audit {
    id: string | undefined;
    roomName: string | undefined;
    type: string | undefined;
    status: string | undefined;
    participants: Participant[] = [];
    onlyAdmin: boolean = false;

    members: User[] = []; // only for compare/listing
}

export class Participant {
    id?: string;
    adminFlag: boolean = false;


}