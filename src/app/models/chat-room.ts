import { Audit } from "./audit";
export class ChatRoom extends Audit {
    id: string | undefined;
    roomName: string | undefined;
    type: string | undefined;
    status: string | undefined;
    participants: string[] = [];
    admins: string[] = [];
}