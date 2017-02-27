import { execSync } from 'child_process'
import * as express from 'express'


export function startupMigration() {
    execSync('./node_modules/.bin/knex migrate:latest');    
}


export function newCorsMiddleware(clients: string[]): express.RequestHandler {
    const localClients = clients.slice(0);
    
    return function(req: express.Request, res: express.Response, next: express.NextFunction): any {
	// If origin is one of the allowed ones we emit an Access-Control-Allow-Origin header, with the
	// specific origin (because only one is allowed). Otherwise, we omit it, and the resource won't
	// be accessible in a CORS setting.
        const origin = req.header('Origin');

	if (localClients.indexOf(origin) != -1) {
	    res.header('Access-Control-Allow-Origin', origin);
	}

	// Headers allowed for now.
	res.header('Access-Control-Allow-Headers', 'X-NeonCity-AuthInfo'); // TODO: make this better

	// Fire away.
	next();	
    };
}
