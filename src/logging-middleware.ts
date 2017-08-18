const newBunyanLoggerMiddleware = require('express-bunyan-logger');


export function newLogginMiddleware() {
    return newBunyanLoggerMiddleware({
        name: 'core',
        streams: [{
            level: 'info',
            stream: process.stdout
        }]
    });
}
