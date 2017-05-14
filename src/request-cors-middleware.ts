import * as express from 'express'
import * as HttpStatus from 'http-status-codes'

import { Request } from './request'


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

        if (req.method == 'OPTIONS') {
            res.status(HttpStatus.NO_CONTENT);
            res.end();
            return;
        }

	// Fire away.
	next();	
    };
}
