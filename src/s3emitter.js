import {config} from 'dotenv'
config()

import S3Client from 'aws-sdk/clients/s3'
// import * as AmazonCredentials from 'aws-sdk/lib/credentials'

// console.dir(S3Client)

// let S3Credentials = new AmazonCredentials(process.env.S3_KEY, process.env.S3_SECRET)



let S3 = new S3Client({ region: process.env.S3_REGION, region: process.env.S3_REGION, accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET })


export default function (resource) {
    S3.putObject(resource, (err, data) => { if(err) console.warn(err) })
}