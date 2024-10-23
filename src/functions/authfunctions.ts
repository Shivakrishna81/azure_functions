const { app } = require('@azure/functions');
const axios = require('axios')
const jwt = require('jsonwebtoken');
import userdao from "../../dao/userdao";
import { messages } from "../../shared/messages.shared";
import { ApiResponse } from "../../shared/response.shared";
const { connectDB } = require("../../db/connection")


app.http('authfunctions', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request: any, context: any) => {
        context.log(`requested url "${request.url}"`);
        await connectDB();

        const tenantId: string = process.env.TENANT_ID;
        const clientId: string = process.env.CLIENT_ID;
        const clientSecret: string = process.env.CLIENT_SECRET;
        const redirectUri: string = process.env.REDIRECT_URI;

        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        if (url.pathname === '/api/authfunctions' && code) {
            try {
                const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

                const tokenResponse: any = await axios.post(tokenUrl, new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code',
                }).toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const userDetails = await getUserDetails(tokenResponse.data.access_token, context);
                const matchedUser = await userdao.findByEmail(userDetails.userPrincipalName);

                if (!matchedUser) {
                    return ApiResponse(404, messages.alertNotFound)
                }

                const payload = {
                    email: matchedUser.email,
                    role: matchedUser.role,
                    categories: matchedUser.categories,
                };

                const accesstoken = jwt.sign(payload, process.env.JWT_SECRET || "userDetails", { expiresIn: '24h' })

                const data = {
                    token: accesstoken,
                    userDetails: { ...userDetails, ...matchedUser._doc }
                };

                return ApiResponse(200, data)
            } catch (err) {
                const errorMessage = err.response ? err.response.data : err.message;
                return ApiResponse(500, errorMessage)
            }
        } else {
            return ApiResponse(404, messages.alertNotFound)
        }
    }
});


async function getUserDetails(accessToken: string, context: any): Promise<any> {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };
        const response = await axios.get('https://graph.microsoft.com/v1.0/me', { headers });
        return response.data;
    } catch (e) {
        return messages.alertErrorFetchUser + e.message
    }
}
