import S3Client from 'aws-sdk/clients/s3'


let S3 = (process.env.NODE_ENV === 'development') 
            ? new S3Client({ region: process.env.S3_REGION, accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET })
            : new S3Client()


export default function (resource) {
    S3.putObject(resource, (err, data) => { if(err) console.warn(err) })
}