import * as express from 'express'
import * as HttpStatus from 'http-status-codes'

import { Session, XsrfTokenMarshaller } from '@neoncity/identity-sdk-js'

import { Request } from './request'


export function newCheckXsrfTokenMiddleware(justExtract: boolean = false) {
    const xsrfTokenMarshaller = new XsrfTokenMarshaller();
    
    return function(req: Request, res: express.Response, next: express.NextFunction): any {
        try {
            const xsrfTokenRaw = req.header(Session.XsrfTokenHeaderName);
            req.xsrfToken = xsrfTokenMarshaller.extract(xsrfTokenRaw);
        } catch (e) {
            console.log('Bad XSRF token');
            res.status(HttpStatus.BAD_REQUEST);
            res.end();
            return;
        }

        if (!justExtract) {
            if (req.xsrfToken != (req.session as Session).xsrfToken) {
                console.log('Mismatching XSRF token');
                res.status(HttpStatus.BAD_REQUEST);
                res.end();
                return;
            }
        }

        // Fire away.
        next();
    };
}
