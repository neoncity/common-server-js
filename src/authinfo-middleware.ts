import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import { MarshalFrom } from 'raynor'
import * as cookieParser from 'cookie-parser'

import { AuthInfo } from '@neoncity/identity-sdk-js'

import { Request } from './request'


const AUTH_INFO_COOKIE_NAME = 'neoncity-authinfo';
const AUTH_INFO_HEADER_NAME = 'X-NeonCity-AuthInfo';


export enum AuthInfoLevel {
    None = 0,
    SessionId = 1,
    SessionIdAndAuth0AccessToken = 2
}


export function newAuthInfoMiddleware(authInfoLevel: AuthInfoLevel) {
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
    const cookieParserMiddleware = cookieParser();

    let mustHaveSession = false;
    let mustHaveAuth0AuthToken = false;

    // A nice use of switch fall through.
    switch (authInfoLevel)
    {
        case AuthInfoLevel.SessionIdAndAuth0AccessToken:
            mustHaveAuth0AuthToken = true;
        case AuthInfoLevel.SessionId:
            mustHaveSession = true;
    }

    return function(req: Request, res: express.Response, next: express.NextFunction): any {
	cookieParserMiddleware(req, res, () => {
	    let authInfoSerialized: string|null = null;
	    
	    if (req.cookies[AUTH_INFO_COOKIE_NAME] != undefined) {
		authInfoSerialized = req.cookies[AUTH_INFO_COOKIE_NAME];
	    } else if (req.header(AUTH_INFO_HEADER_NAME) != undefined) {
		authInfoSerialized = req.cookies[AUTH_INFO_COOKIE_NAME];
	    }

	    if (authInfoSerialized == null) {
		if (mustHaveSession) {
		    console.log('Expected some auth info but there was none');
		    res.status(HttpStatus.BAD_REQUEST);
		    res.end();
		    return;
		}

		req.authInfo = null;

		// Fire away.
		next();
		return;
	    }

	    let authInfo: AuthInfo|null = null;
	    try {
		authInfo = authInfoMarshaller.extract(JSON.parse(authInfoSerialized));
	    } catch (e) {
		console.log('Bad auth info');
		res.status(HttpStatus.BAD_REQUEST);
		res.end();
		return;
	    }

	    if (mustHaveAuth0AuthToken && authInfo.auth0AccessToken == null) {
		console.log('Expected auth token but none was had');
		res.status(HttpStatus.BAD_REQUEST);
		res.end();
		return;
	    }

	    req.authInfo = authInfo;

	    // Fire away.
	    next();
	});
    }
}
