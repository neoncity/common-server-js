import { Env, envToString, isOnServer } from '@neoncity/common-js'

const newBunyanLoggerMiddleware = require('express-bunyan-logger');
const Bunyan2Loggly = require('bunyan-loggly');


const LOGGLY_BUFFER_SIZE = 10;
const LOGGLY_TIMEOUT_MS = 1000;


export function newLoggingMiddleware(name: string, env: Env, logglyToken: string|null = null, logglySubdomain: string|null = null) {
    const streams = [];

    streams.push({
        level: 'info',
        stream: process.stdout
    });

    if (isOnServer(env)) {
        if (logglyToken == null || logglySubdomain == null) {
            throw new Error('In Staging and Prod Bunyan logging must be configured');
        }

        const logglyConfig = {
            token: logglyToken,
            subdomain: logglySubdomain
        };

        streams.push({
            level: 'info',
            type: 'raw',
            stream: new Bunyan2Loggly(logglyConfig, LOGGLY_BUFFER_SIZE, LOGGLY_TIMEOUT_MS)
        });
    }

    return newBunyanLoggerMiddleware({
        name: name,
        streams: streams,
        neoncity: {
            serviceName: name,
            env: envToString(env)
        }
    });
}
