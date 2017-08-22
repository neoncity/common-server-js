import * as Logger from 'bunyan'
import * as express from 'express'
import * as Rollbar from 'rollbar'

import { AuthInfo, Session } from '@neoncity/identity-sdk-js'


export interface Request extends express.Request {
    requestTime: Date;
    log: Logger;
    errorLog: Rollbar;
    authInfo: AuthInfo | null;
    session: Session | null;
    xsrfToken: string | null;
}
