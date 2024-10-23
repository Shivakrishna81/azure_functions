const jwt = require('jsonwebtoken');

export interface payloadInterface {
    email: string,
    role: string,
    categories?: string[];
    iat: number,
    exp: number
}

export const jwtTokenVerify = (token: string): payloadInterface | null => {
    try {
        const decodedData: payloadInterface = jwt.verify(token, process.env.JWT_SECRET_KEY)
        return decodedData
    } catch (err) {
        return null
    }
}