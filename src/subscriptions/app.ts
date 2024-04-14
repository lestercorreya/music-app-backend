import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk'
import { v4 } from 'uuid'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()

export const getSubscriptionsForUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email } = JSON.parse(event.body || '{}');

        const getSubscriptionsForUserParams = {
            TableName: "subscriptions",
            IndexName: "UserIndex",
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

        return {
            statusCode: 200,
            body: JSON.stringify({ subscriptions: Items })
        }
    }
    catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: err })
        }
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

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Subscription added successfully',
            }),
        };
    }
    catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: err })
        }
    }
}