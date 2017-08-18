import { Env } from '@neoncity/common-js'

const newBunyanLoggerMiddleware = require('express-bunyan-logger');
const Bunyan2Loggly = require('bunyan-loggly');


const BUNYAN_BUFFER_SIZE = 10;
const BUNYAN_TIMEOUT_MS = 1000;


export function newLoggingMiddleware(name: string, env: Env, logglyToken: string|null = null, logglySubdomain: string|null = null) {
    const streams = [];

    streams.push({
        level: 'info',
        stream: process.stdout
    });

    if (env == Env.Staging || env == Env.Prod) {
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
            stream: new Bunyan2Loggly(logglyConfig, BUNYAN_BUFFER_SIZE, BUNYAN_TIMEOUT_MS)
        });
    }

    return newBunyanLoggerMiddleware({
        name: name,
        streams: streams,
        neoncity: {
            serviceName: name,
            env: env.toString()
        }
    });
}
