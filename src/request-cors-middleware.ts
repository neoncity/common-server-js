import * as express from 'express'
import * as HttpStatus from 'http-status-codes'

import { AuthInfo } from '@neoncity/identity-sdk-js'

import { Request } from './request'


export function newCorsMiddleware(clients: string[], methods: string[], headers: string[]): express.RequestHandler {
    const maxAgeInSeconds = 86400; // A full day
    const localClients = clients.slice(0);
    const localMethods = ['OPTIONS'].concat(methods).join(',');
    const localHeaders = [AuthInfo.HeaderName, 'Content-Type'].concat(headers).join(',');
    
    return function(req: Request, res: express.Response, next: express.NextFunction): any {
        // Fill in Access-Control-Allow-Origin header. If origin is one of the allowed ones we emit
        // an Access-Control-Allow-Origin header, with the specific origin. This is because a single
        // origin is allowed, though clients might consist of multiple origins. Otherwise, we omit
        // it, and the resource won't be accessible in a CORS setting.
        const origin = req.header('Origin');

        if (localClients.indexOf(origin) != -1) {
            res.header('Access-Control-Allow-Origin', origin);
        }

        // Fill in the Access-Control-Max-Age header.
        res.header('Access-Control-Max-Age', maxAgeInSeconds.toString());

        // Fill in the Access-Control-Allow-Credentials header.
        res.header('Access-Control-Allow-Credentials', 'true');

        // Fill in the Access-Control-Allow-Methods header.
        res.header('Access-Control-Allow-Methods', localMethods);

        // Fill in the Access-Control-Allow-Headers header.
        res.header('Access-Control-Allow-Headers', localHeaders);

        if (req.method == 'OPTIONS') {
            res.status(HttpStatus.NO_CONTENT);
            res.end();
            return;
        }

        // Fire away.
        next(); 
    };
}
