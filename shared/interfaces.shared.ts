export interface UserPayload {
    email: string;
    role: string;
    categories: string[];
    iat: number;
    exp: number;
}