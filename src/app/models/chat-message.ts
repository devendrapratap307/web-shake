export class ChatMessage {
    roomId: string | undefined;
    sender: string | undefined;
    content: string | undefined;
    type: string | undefined;
    status: string = 'ACT';
    timeStamp?: Date;
}