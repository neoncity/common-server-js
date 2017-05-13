import * as express from 'express'
import { MarshalFrom } from 'raynor'

import { AuthInfo } from '@neoncity/identity-sdk-js'

import { Request } from './request'


export function newAuthInfoMiddleware(): express.RequestHandler {
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
        
    return function(req: Request, res: express.Response, next: express.NextFunction): any {
	// Extract the auth info serialized header.
	const authInfoSerialized: string|undefined = req.header('X-NeonCity-AuthInfo');
	
	if (typeof authInfoSerialized == 'undefined') {
	    req.authInfo = null;
	    next();
	    return;
	}

	// Extract the auth info from the header.
	try {
	    req.authInfo = authInfoMarshaller.extract(JSON.parse(authInfoSerialized));
	} catch (e) {
	    res.status(400);
	    res.end();
	    return;
	}
	
	// Fire away.
	next();
    }
}
