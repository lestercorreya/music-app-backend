import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { createResponse } from '../functions/helperFunctions'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()

export const getSubscriptionsForUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email } = JSON.parse(event.body || '{}');

        const getSubscriptionsForUserParams = {
            TableName: "subscriptions",
            IndexName: "QueryIndex",
            KeyConditionExpression: "#user = :email",
            ExpressionAttributeNames: {
                "#user": "user"
            },
            ExpressionAttributeValues: {
                ":email": email
            }
        }
        const { Items = [] } = await dynamoDBClient.query(getSubscriptionsForUserParams).promise()

        for (let i = 0; i < Items.length; i++) {
            const getMusicParams = {
                TableName: "music",
                Key: {
                    title: Items[i].music
                }
            }

            const musicData = await dynamoDBClient.get(getMusicParams).promise()

            Items[i] = musicData.Item ? musicData.Item : {}
        };

        return createResponse(200, { subscriptions: Items })
    }
    catch {
        return createResponse(500, { message: "Something went wrong!" })
    }
}

export const addSubscriptionHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { music, user } = JSON.parse(event.body || '{}');

        const newSubscription = {
            TableName: "subscriptions",
            Item: {
                id: v4(),
                music,
                user
            }
        };

        await dynamoDBClient.put(newSubscription).promise();

        return createResponse(200, { message: "Subscription added successfully!" })
    }
    catch {
        return createResponse(500, { message: "Something went wrong!" })
    }
}

export const removeSubscriptionHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { music, user } = JSON.parse(event.body || '{}');

        const getSubscriptionsForUserParams = {
            TableName: "subscriptions",
            IndexName: "QueryIndex",
            KeyConditionExpression: "#user = :user and music = :music",
            ExpressionAttributeNames: {
                "#user": "user"
            },
            ExpressionAttributeValues: {
                ":user": user,
                ":music": music
            }
        }
        const { Items = [] } = await dynamoDBClient.query(getSubscriptionsForUserParams).promise()

        for (const Item of Items) {
            const removeSubscriptionParams = {
                TableName: "subscriptions",
                Key: {
                    id: Item.id
                }
            }
            await dynamoDBClient.delete(removeSubscriptionParams).promise()

        };

        return createResponse(200, { message: "Subscription Deleted Successfully!" })
    }
    catch {
        return createResponse(500, { message: "Something went wrong!" })
    }
}