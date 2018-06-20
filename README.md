## Prerequisites
1. Install [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com)
2. From project root folder install all the dependencies: `npm install`
3. Install [Nginx](https://www.nginx.com) server

## Run
### Development mode
`npm run dev`: [concurrently](https://github.com/kimmobrunfeldt/concurrently) execute MongoDB, Angular build, TypeScript compiler and Express server.

Open your browser and go to [localhost:4200](http://localhost:4200).

Angular and Express files are being watched. Any change automatically creates a new bundle, restart Express server and reload your browser.

### Production mode
Before building the application:
* Check and change the Neo4J url and password (`server/config/config.ts`)
* Check and change the MongoDB url and password (`.env`)
* Check and change the public server name (`nginx/heritamus.conf`)

#### For a new installation:
 
Launch `./install.sh` to:
- Install the nginx config
- Restart nginx
- Build the application
- Setup the heritamus service 
- Run the application service

#### After updating the application:

Launch `./build.sh` to:
- Build the application
- Restart the application service

## Please open an issue if
* You have any suggestion to improve this project
* You noticed any problem or error

## Running TSLint
Run `ng lint` (frontend) and `npm run lintbe` (backend) to execute the linter via [TSLint](https://palantir.github.io/tslint/).
