import { error } from 'console';
import Redis from 'ioredis';
//const redis = require('ioredis');
require('dotenv').config();

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis is connected`);
        return process.env.REDIS_URL;
    }
    throw error(`Redis connection Failed`);
}

//const pubClient = new Redis(`redis://${process.env.AWS_REDIS_HOST}:6379`)

export const redis = new Redis(redisClient());