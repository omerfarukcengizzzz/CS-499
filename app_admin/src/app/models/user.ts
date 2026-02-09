export class User {
    email: string;
    name: string;

    constructor() {
        this.email = '';
        this.name = '';
    }
}

export class AuthResponse {
    token: string;

    constructor() {
        this.token = '';
    }
}
