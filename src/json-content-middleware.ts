import * as express from 'express'

import { Request } from './request'


export function newJsonContentMiddleware(): express.RequestHandler {
    return (_req: Request, res: express.Response, next: express.NextFunction) => {
        res.type('json');
        // Fire away.
        next();
    };
}
