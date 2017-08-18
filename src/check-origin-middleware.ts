import * as express from 'express'
import * as HttpStatus from 'http-status-codes'

import { Request } from './request'


export function newCheckOriginMiddleware(clients: string[]) {
    const localClients = clients.slice(0);

    return function(req: Request, res: express.Response, next: express.NextFunction): any {
        const origin = req.header('Origin') as string;

        if (localClients.indexOf(origin) == -1) {
            req.log.warn('Origin is not allowed');
            res.status(HttpStatus.BAD_REQUEST);
            res.end();
            return;
        }

        // Fire away.
        next();
    };
}
