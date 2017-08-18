const newBunyanLoggerMiddleware = require('express-bunyan-logger');


export function newLogginMiddleware(name: string) {
    return newBunyanLoggerMiddleware({
        name: name,
        streams: [{
            level: 'info',
            stream: process.stdout
        }]
    });
}
