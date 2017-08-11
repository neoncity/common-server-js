import { execSync } from 'child_process'


export function startupMigration() {
    execSync('./node_modules/.bin/knex migrate:latest');
}
