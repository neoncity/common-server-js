import { wrap } from 'async-middleware'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'

import { isLocal, Env } from '@neoncity/common-js'
import { AuthInfo, IdentityClient } from '@neoncity/identity-sdk-js'

import { Request } from './request'


export enum SessionLevel {
    None,
    Session,
    SessionAndUser
}


export function newSessionMiddleware(sessionLevel: SessionLevel, env: Env, origin: string, identityClient: IdentityClient): express.RequestHandler {

    let mustHaveSession = false;
    let mustHaveUser = false;

    // A nice use of switch fall through.
    switch (sessionLevel)
    {
        case SessionLevel.SessionAndUser:
            mustHaveUser = true;
        case SessionLevel.Session:
            mustHaveSession = true;
    }
    
    return wrap(async (req: Request, res: express.Response, next: express.NextFunction) => {
	try {
	    if (mustHaveSession && req.authInfo == null) {
		console.log('Must have auth info');
		res.status(HttpStatus.BAD_REQUEST);
		res.end();
		return;
	    }

	    if (mustHaveUser && !(req.authInfo != null && req.authInfo.auth0AccessToken != null)) {
		console.log('Must have auth0 access token');
		res.status(HttpStatus.BAD_REQUEST);
		res.end();
		return;
	    }

	    if (req.authInfo == null) {
		req.session = null;
	    } else if (req.authInfo.auth0AccessToken == null) {
		req.session = await identityClient.withContext(req.authInfo as AuthInfo, origin).getSession();
	    } else {
		req.session = await identityClient.withContext(req.authInfo as AuthInfo, origin).getUserOnSession();
	    }
	} catch (e) {
	    // TODO: should probably log something here.
	    if (mustHaveSession) {
		if (e.name == 'UnauthorizedIdentityError') {
		    console.log('Unauthorized user');
		    res.status(HttpStatus.UNAUTHORIZED);
		    res.end();
		    return;
		}

		if (e.name == 'IdentityError') {
		    console.log('Identity service error');
		    res.status(HttpStatus.BAD_GATEWAY);
		    res.end();
		    return;
		}

		console.log(`Identity service error - ${e.toString()}`);
		if (isLocal(env)) {
                    console.log(e);
		}
		
		res.status(HttpStatus.INTERNAL_SERVER_ERROR);
		res.end();
		return;
	    }
	}

	// Fire away.
	next();
    });
}
