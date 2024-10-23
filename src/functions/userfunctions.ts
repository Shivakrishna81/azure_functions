import { app } from '@azure/functions';
import { connectDB } from '../../db/connection';
import Userdao from '../../dao/userdao';
import { sendEmail } from '../../utils/sendMail';
import { jwtTokenVerify, payloadInterface } from '../../utils/jwtverifytoken';
import { messages } from '../../shared/messages.shared';
import { ApiResponse } from '../../shared/response.shared';

app.http('userfunctions', {
    methods: ['GET', 'POST', 'DELETE'],
    authLevel: 'anonymous',
    handler: async (request: any, context: any): Promise<any> => {
        try {
            context.log(`HTTP function processed request for URL "${request.url}"`);
            await connectDB();

            const tokenHeader = request.headers.get('Authorization');
            if (!tokenHeader) {
                return ApiResponse(401, messages.alertProvideToken)
            }
            const token = tokenHeader.split(" ")[1]
            const userPayload = jwtTokenVerify(token);

            if (!userPayload) {
                return ApiResponse(401, messages.alertValidToken)
            }

            if (userPayload.role !== 'admin') {
                return ApiResponse(403, messages.alertAuthorization + userPayload)
            }

            if (request.method === 'POST') {
                const userDetails = await request.json();
                context.log('User details:', userDetails);

                const savedUser = await Userdao.createUser(userDetails);

                await sendEmail(
                    userDetails.email,
                    'Invitation',
                    `You @ ${userDetails.email} have been invited successfully.`,
                    `<p>Hey! <strong>${userDetails.email}</strong>, you're invited to the file manager application as role: <strong>${userDetails.role}</strong>.</p>`
                );
                return ApiResponse(201, savedUser)
            }
            if (request.method === 'GET') {
                const userData = await Userdao.findAllUsers();
                return ApiResponse(200, userData)
            }
            if (request.method === 'DELETE') {
                const userMail = request.query.get('userMail');
                await Userdao.deleteUserByEmail(userMail);
                return ApiResponse(200, messages.successUserDeleted)
            }
            return ApiResponse(405, messages.server2)

        } catch (error) {
            return ApiResponse(500, messages.server1 + error.message)
        }
    },
});