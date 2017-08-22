import * as express from 'express'

import { Request } from './request'


export function newRequestTimeMiddleware(): express.RequestHandler {
    return function(req: Request, _: express.Response, next: express.NextFunction): any {
        req.requestTime = new Date(Date.now());
        next();
    };
}
