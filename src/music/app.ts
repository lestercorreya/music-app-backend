import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk'
import { createResponse } from '../functions/helperFunctions'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()
const s3Client = new AWS.S3({ region: "ap-southeast-2" })

export const getMusicHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const getMusicParams = {
            TableName: "music",
        }
        const data = await dynamoDBClient.scan(getMusicParams).promise()

        const itemsWithPresignedUrls = await Promise.all(data.Items!.map(async (item) => {
            const objectKey = `${item.artist}.jpeg`;
            const url = await getPresignedUrl(objectKey);
            return { ...item, img_url: url };
        }));

        return createResponse(200, { music: itemsWithPresignedUrls })
    }
    catch {
        return createResponse(500, { message: "Something went wrong!" })
    }
}

const getPresignedUrl = (objectKey: string) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: "music-app-backend",
            Key: objectKey,
            Expires: 3600
        };

        s3Client.getSignedUrl('getObject', params, (err, url) => {
            if (err) {
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}