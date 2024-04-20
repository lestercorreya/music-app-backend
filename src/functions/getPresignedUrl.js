import AWS from 'aws-sdk'

const s3Client = new AWS.S3({ region: "ap-southeast-2" })

function getPresignedUrl(bucketName, objectKey, expirationInSeconds) {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
        Expires: expirationInSeconds // Expiration time in seconds
    };

    s3Client.getSignedUrl('getObject', params, (err, url) => {
        if (err) {
            console.log("Error generating presigned URL", err);
        } else {
            console.log("Presigned URL: ", url);
            // Use this URL in your client application to fetch the image
        }
    });
}

getPresignedUrl("music-app-backend", "Arcade Fire.jpeg", 3600)