import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import * as multipart from "parse-multipart";
import { sendEmail } from "../../utils/sendMail";
import { connectDB } from "../../db/connection";
import Filedao from "../../dao/filedao";
import { jwtTokenVerify } from "../../utils/jwtverifytoken";
import { ApiResponse } from "../../shared/response.shared";
import { messages } from "../../shared/messages.shared";
import { UserPayload } from "../../shared/interfaces.shared";



app.http('filefunctions', {
    methods: ['POST', 'GET', 'DELETE'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            context.log(`HTTP function processed request for URL "${request.url}"`);


            const tokenHeader = request.headers.get('Authorization');
            if (!tokenHeader) {
                return ApiResponse(401, messages.alertAuthorization)
            }

            const token = tokenHeader.split(" ")[1];
            const userPayload = jwtTokenVerify(token);

            if (!userPayload) {
                return ApiResponse(403,messages.alertValidToken)
            }

            const category = request.query.get('category');
            if (!userPayload.categories.includes(category)) {
                return ApiResponse(403, messages.alertAuthorization)
            }


            const connectionString = process.env.AzureWebJobsStorage;
            if (!connectionString) {
                return ApiResponse(500, messages.alertNoConnectionString)
            }

            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerName = "project-files";
            const containerClient = blobServiceClient.getContainerClient(containerName);
            await containerClient.createIfNotExists();
            await connectDB();


            if (request.method === 'POST') {
                const contentType = request.headers.get('content-type');
                const body = await request.arrayBuffer();
                const bodyBuffer = Buffer.from(body);

                if (!bodyBuffer || bodyBuffer.length === 0) {
                    return ApiResponse(400, messages.alertBodyEmpty)
                }

                const boundary = multipart.getBoundary(contentType);
                let parts: multipart.Part[];
                try {
                    parts = multipart.Parse(bodyBuffer, boundary);
                } catch (error) {
                    return ApiResponse(400, messages.alertMultipartError)
                }

                const file = parts.find(part => part.filename);
                if (!file) {
                    return ApiResponse(400, messages.alertNoFileFound)
                }

                const blobName = file.filename;
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                try {
                    await blockBlobClient.upload(file.data, file.data.length);
                    await Filedao.addFile(blobName, blockBlobClient.url, category,file.data.length);

                    const subject = 'File Upload Success';
                    const text = `Your file ${file.filename} has been uploaded successfully to category: ${category}`;
                    const html = `<p>Your file <strong>${file.filename}</strong> has been uploaded successfully to category: <strong>${category}</strong>.</p>`;

                    await sendEmail(userPayload.email, subject, text, html);

                    return ApiResponse(200, { filename: file.filename, url: blockBlobClient.url ,file:file.data.length})

                } catch (error) {
                    return ApiResponse(500, messages.alertFileUploadError)
                }
            }

            else if (request.method === 'GET') {
                try {
                    const filesData = await Filedao.findFilesByCategory(category);

                    return ApiResponse(200, filesData)
                    // return {
                    //     status: 200,
                    //     headers: {'Content-Type': 'application/json'},
                    //     body: JSON.stringify(filesData)
                    // };
                } catch (error) {
                    return ApiResponse(500, messages.alertFetchFilesError)
                }
            }
            else if (request.method === 'DELETE') {
                const blobName = request.query.get('blobName');
                if (!blobName) {
                    return ApiResponse(400, messages.alertFileNameRequired)
                }

                try {
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    await blockBlobClient.delete();
                    await Filedao.deleteFileByName(blobName);

                    const subject = 'File Delete Success!';
                    const text = `Your file ${blobName} has been deleted successfully from category: ${category}`;
                    const html = `<p>Your file <strong>${blobName}</strong> has been deleted successfully from category: <strong>${category}</strong>.</p>`;

                    await sendEmail(userPayload.email, subject, text, html);

                    return ApiResponse(200, messages.successFileDeleted)

                } catch (error) {
                    return ApiResponse(500, messages.alertFileDeleteError)
                }
            }

        } catch (error: any) {
            return ApiResponse(500, messages.server1)
        }
    },
});