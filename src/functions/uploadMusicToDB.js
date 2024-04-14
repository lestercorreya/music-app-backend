import AWS from 'aws-sdk'
import jsonData from '../a1.json' assert {type: 'json'}

const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-2" })

jsonData.songs.forEach(({ title, artist, year, web_url, img_url }) => {
    const newMusic = {
        TableName: "music",
        Item: {
            title,
            artist,
            year,
            web_url,
            img_url
        }
    };

    dynamoDBClient.put(newMusic).promise()
        .then(() => {
            console.log(title + " Song Uploaded Successfully!")
        })
        .catch((err) => {
            console.log(err)
        })
})

