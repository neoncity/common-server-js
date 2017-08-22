import * as express from 'express'
import * as Rollbar from 'rollbar'

import { Env, isOnServer, envToString } from '@neoncity/common-js'

import { Request } from './request'


const ROLLBAR_ITEMS_PER_MINUTE = 60;
const ROLLBAR_MAX_ITEMS = 0;


export function newErrorsMiddleware(name: string, env: Env, rollbarToken: string|null = null) {
    if (isOnServer(env) && rollbarToken == null) {
        throw new Error('In Staging and Prod Rollbar error logging must be configured');
    }

    const rollbar = new Rollbar({
        accessToken: rollbarToken != null ? rollbarToken : 'FAKE_TOKEN_WONT_BE_USED_IN_LOCAL_OR_TEST',
        logLevel: 'warning',
        reportLevel: 'warning',
        captureUncaught: true,
        captureUnhandledRejections: true,
        enabled: isOnServer(env),
        itemsPerMinute: ROLLBAR_ITEMS_PER_MINUTE,
        maxItems: ROLLBAR_MAX_ITEMS,
        payload: {
            // TODO: fill in the person field!
            serviceName: name,
            environment: envToString(env)
        }
    });

    return function(req: Request, _: express.Response, next: express.NextFunction): any {
        req.errorLog = rollbar;
        next();
    };
}
