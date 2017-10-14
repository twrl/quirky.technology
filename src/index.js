import {config} from 'dotenv'
config()

import { createClient } from 'contentful'

const contentful = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    host: process.env.CONTENTFUL_HOST
})


import s3emitter from './s3emitter'

import model from './model'

function handler() {
    
    model(contentful, s3emitter)
    
}

import fsemitter from './fsemitter'

function tester() {
    model(contentful, fsemitter)
}

export { handler, tester }