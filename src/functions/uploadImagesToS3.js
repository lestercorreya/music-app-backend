import AWS from 'aws-sdk'
import axios from 'axios'
import fs from 'fs'
import jsonData from '../a1.json' assert {type: 'json'}
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const s3Client = new AWS.S3({ region: "ap-southeast-2" })
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ region: "ap-southeast-2" })

// make an images directory in the current directory
try {
    fs.mkdirSync(__dirname + "/images", { recursive: true });
    console.log('Directory created successfully');
} catch (error) {
    console.error('Error creating directory:', error);
}

// loop through each song in json, upload it(also update img_url in music table) and download it asyncounously
jsonData.songs.forEach(async (song) => {
    const response = await axios({
        url: song.img_url,
        method: 'GET',
        responseType: 'stream'
    });

    const uploadParams = {
        Bucket: "music-app-backend",
        Body: response.data,
        Key: song.artist + ".jpeg",
        ACL: "public-read",
        ContentType: 'image/jpeg'
    }

    s3Client.upload(uploadParams).promise()
        .then(async (data) => {
            console.log(song.artist + " Image Uploaded Successfully!")

            // update img_url in music table
            const updateMusicParams = {
                TableName: "music",
                Key: {
                    title: song.title
                },
                UpdateExpression: "set img_url = :img_url",
                ExpressionAttributeValues: {
                    ":img_url": data.Location  // 'S' denotes String type
                }
            }

            dynamoDBClient.update(updateMusicParams).promise()
                .then(() => {
                    console.log("Music url updated successfully!")
                })
                .catch(() => {
                    console.log("There was an error in updating the image!")
                })
        })
        .catch(() => {
            console.log("There was an error in uploading the image!")
        })

    downloadImage(song.img_url, __dirname + "/images/" + song.title + ".jpg")
        .then(() => {
            console.log(song.artist + " Image Downloaded Successfully!")
        })
        .catch((err) => {
            console.log(err)
        })
})

async function downloadImage(url, filePath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}



