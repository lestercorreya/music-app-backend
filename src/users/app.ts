import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk'
import jwt from 'jsonwebtoken'
import { createResponse } from '../functions/helperFunctions'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()

export const getUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers["Authorization"]
        const token = authHeader && authHeader.split(" ")[1]

        if (token == null) throw new Error('JWT Token invalid');

        var userObject = jwt.verify(token, "secret")

        return {
            statusCode: 200,
            body: JSON.stringify(userObject)
        }
    }
    catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: err })
        }
    }
}

export const loginUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email, password } = JSON.parse(event.body || '{}');

        const userParam = {
            TableName: "users",
            Key: {
                'email': email,
            }
        }

        const { Item } = await dynamoDBClient.get(userParam).promise()

        if (Item) {
            if (Item.password === password) {
                const token = jwt.sign({ email: Item.email }, 'secret')

                return createResponse(200, { token })
            } else {
                return createResponse(400, { message: "Credentials Invalid!" })
            }
        } else {
            return createResponse(400, { message: "Credentials Invalid!" })
        }
    } catch (err) {
        return createResponse(500, { message: err })
    }
}

export const addUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email, username, password } = JSON.parse(event.body || '{}');

        const userParam = {
            TableName: "users",
            Key: {
                'email': email
            }
        }

        const { Item } = await dynamoDBClient.get(userParam).promise()

        if (Item) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: event.headers
                })
            }
        } else {
            const newUser = {
                TableName: "users",
                Item: {
                    email,
                    username,
                    password
                }
            };

            await dynamoDBClient.put(newUser).promise();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'User added successfully',
                }),
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Something went wrong!"
            }),
        };
    }
};