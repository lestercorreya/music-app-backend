import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk'
import { createResponse } from '../functions/helperFunctions'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()

export const getMusicHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const getMusicParams = {
            TableName: "music",
        }
        const data = await dynamoDBClient.scan(getMusicParams).promise()

        return createResponse(200, { music: data.Items })
    }
    catch {
        return createResponse(500, { message: "Something went wrong!" })
    }
}