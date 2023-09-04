import MyService from './my.service'
import { Client, Request } from '@pepperi-addons/debug-server'
import jwt from 'jwt-decode';

// add functions here
// this function will run on the 'api/foo' endpoint
// the real function is runnning on another typescript file
export async function foo(client: Client, request: Request) {
    const service = new MyService(client)
    // const res = await service.getAddons()
    // return res
};

export async function dimx_import(client: Client, request: Request) {
   
    const service = new MyService(client);
    if (request.method == 'POST') {
        
        const token = client.OAuthAccessToken;
        const decodedToken: any = jwt(token);
        const currentDistributorUUID = decodedToken["pepperi.distributoruuid"];
        console.log(`**Gallery**  request.body: ${JSON.stringify(request.body)}@@@@`);
        //let object = request.body['Object'];
        
        return await service.importDataSource(request.body,currentDistributorUUID);
    }
    else if (request.method == 'GET') {
        throw new Error(`Method ${request.method} not supported`);
    }
}



export async function dimx_export(client:Client, request: Request): Promise<any> {
    try {
        const service = new MyService(client);
        if (request.method == 'POST') {
            return service.exportDataSource(request.body);
        }
        else if (request.method == 'GET') {
            throw new Error(`Method ${request.method} not supported`);
        }
    } catch(err) {
        throw err;
    }
}

