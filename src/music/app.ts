import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()

export const getMusicHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const getMusicParams = {
            TableName: "music",
        }
        const data = await dynamoDBClient.scan(getMusicParams).promise()

        return {
            statusCode: 200,
            body: JSON.stringify({ music: data.Items })
        }
    }
    catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: err })
        }
    }
}