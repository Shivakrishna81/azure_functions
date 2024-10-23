import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import categorydao from "../../dao/categorydao";
import { connectDB } from "../../db/connection";
import { jwtTokenVerify } from "../../utils/jwtverifytoken";
import { ApiResponse } from "../../shared/response.shared";
import { messages } from "../../shared/messages.shared";


app.http('categoriesfunction', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        await connectDB()

        context.log(`HTTP function processed request for URL "${request.url}"`);
        const tokenHeader = request.headers.get('Authorization');
        if(!tokenHeader){
            return ApiResponse(401,messages.alertAuthorization)
        }

        const token=tokenHeader.split(" ")[1] 
        const userPayload = jwtTokenVerify(token);

        if (!userPayload) {
            return ApiResponse(403,messages.alertValidToken)
        }

        if(request.method==='GET'){
            const categories=await categorydao.getAllUserCategories(userPayload.categories)
            const userCategories=categories 
            return ApiResponse(200,userCategories)
        }
    }
});
