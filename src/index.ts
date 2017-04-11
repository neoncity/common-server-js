import { execSync } from 'child_process'
import * as express from 'express'
import { MarshalFrom } from 'raynor'

import { AuthInfo } from '@neoncity/identity-sdk-js'


export interface Request extends express.Request {
    requestTime: Date;
    authInfo: AuthInfo|null;
}


export function startupMigration() {
    execSync('./node_modules/.bin/knex migrate:latest');    
}


export function newRequestTimeMiddleware(): express.RequestHandler {
    return function(req: Request, _: express.Response, next: express.NextFunction): any {
	req.requestTime = new Date(Date.now());
	next();
    }
}


export function newCorsMiddleware(clients: string[]): express.RequestHandler {
    const localClients = clients.slice(0);
    
    return function(req: Request, res: express.Response, next: express.NextFunction): any {
	// If origin is one of the allowed ones we emit an Access-Control-Allow-Origin header, with the
	// specific origin (because only one is allowed). Otherwise, we omit it, and the resource won't
	// be accessible in a CORS setting.
        const origin = req.header('Origin');

	if (localClients.indexOf(origin) != -1) {
	    res.header('Access-Control-Allow-Origin', origin);
	}

	// Headers allowed for now.
	res.header('Access-Control-Allow-Headers', 'X-NeonCity-AuthInfo, Content-Type'); // TODO: make this better
	res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE'); // TODO: make this better

	// Fire away.
	next();	
    };
}


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
