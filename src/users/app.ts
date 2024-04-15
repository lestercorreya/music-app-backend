import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk'
import jwt from 'jsonwebtoken'
import { createResponse } from '../functions/helperFunctions'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient()

export const getUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { token } = JSON.parse(event.body || '{}');

        if (token == null) throw new Error('JWT Token invalid');

        var userObject = jwt.verify(token, "secret")

        return createResponse(200, { user: userObject })
    }
    catch {
        return createResponse(400, { message: "Something went wrong!" })
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
                const token = jwt.sign({ email: Item.email, username: Item.username }, 'secret')

                return createResponse(200, { token })
            } else {
                return createResponse(400, { message: "Credentials Invalid!" })
            }
        } else {
            return createResponse(400, { message: "email or password is invalid!" })
        }
    } catch (err) {
        return createResponse(500, { message: "email or password is invalid!" })
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
            return createResponse(400, { message: "The email already exists!" })
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

            return createResponse(200, { message: "User Added Successfully!" })
        }
    } catch (err) {
        return createResponse(500, { message: "Something went Wrong!" })
    }
};