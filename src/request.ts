import * as express from 'express'

import { AuthInfo } from '@neoncity/identity-sdk-js'


export interface Request extends express.Request {
    requestTime: Date;
    authInfo: AuthInfo|null;
}