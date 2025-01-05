export class User {
    id: string | undefined;
    username: string | undefined;
    password: string | undefined;
    confirmPassword: string | undefined;
    email: string | undefined;
    name: string |undefined;

    adminFlag: boolean = false; // for group
}

export class SearchReq {
    page = 1;
    limit = 10;

    label: string | undefined;
    name: string |undefined;
    username: string | undefined;

    status: string | undefined;
    type: string | undefined;
    participant: string | undefined;
    roomId: string | undefined;
    
}