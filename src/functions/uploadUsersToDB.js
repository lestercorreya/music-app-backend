import AWS from 'aws-sdk'

const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-2" })

const usersData = [
    {
        email: "s39831610@student.rmit.edu.au",
        username: "Lester Correya0",
        password: "012345"
    },
    {
        email: "s39831611@student.rmit.edu.au",
        username: "Lester Correya1",
        password: "123456"
    },
    {
        email: "s39831612@student.rmit.edu.au",
        username: "Lester Correya2",
        password: "234567"
    },
    {
        email: "s39831613@student.rmit.edu.au",
        username: "Lester Correya3",
        password: "345678"
    },
    {
        email: "s39831614@student.rmit.edu.au",
        username: "Lester Correya4",
        password: "456789"
    },
    {
        email: "s39831615@student.rmit.edu.au",
        username: "Lester Correya5",
        password: "567890"
    },
    {
        email: "s39831616@student.rmit.edu.au",
        username: "Lester Correya6",
        password: "678901"
    },
    {
        email: "s39831617@student.rmit.edu.au",
        username: "Lester Correya7",
        password: "789012"
    },
    {
        email: "s39831618@student.rmit.edu.au",
        username: "Lester Correya8",
        password: "890123"
    },
    {
        email: "s39831619@student.rmit.edu.au",
        username: "Lester Correya9",
        password: "901234"
    }
]

usersData.forEach(({ email, username, password }) => {
    const newUserParams = {
        TableName: "users",
        Item: {
            email,
            username,
            password
        }
    };

    dynamoDBClient.put(newUserParams).promise()
        .then(() => {
            console.log(email + " User Added Successfully!")
        })
        .catch((err) => {
            console.log(err)
        })
})



