import jwt from 'jwt-decode';
import { Injectable } from "@angular/core";
import { PepColorSettings } from "@pepperi-addons/ngx-composite-lib/color-settings";
import { PepColorService } from "@pepperi-addons/ngx-lib";
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { PepDataConvertorService, PepHttpService, PepSessionService } from '@pepperi-addons/ngx-lib';
import { config } from '../app/addon.config';

@Injectable({
    providedIn: 'root',
})
export class GalleryService {
    
    papiClient: PapiClient
    accessToken = '';
    parsedToken: any
    papiBaseURL = ''

    constructor(private pepColorService: PepColorService,
                public session: PepSessionService,
                public pepperiDataConverter: PepDataConvertorService,
                private httpService: PepHttpService) {
                    const accessToken = this.session.getIdpToken();
                    this.parsedToken = jwt(accessToken);
                    this.papiBaseURL = this.parsedToken["pepperi.baseurl"];

                    this.papiClient = new PapiClient({
                        baseURL: this.papiBaseURL,
                        token: this.session.getIdpToken(),
                        addonUUID: config.AddonUUID,
                        suppressLogging:true
                        //addonSecretKey: client.AddonSecretKey,
                        //actionUUID: client.AddonUUID
                    });
                }
    
     async getFlowName(flowUUID){
        let flowName = undefined;
        try{
            const flow = (await this.papiClient.userDefinedFlows.search({ KeyList: [flowUUID], Fields: ['Key', 'Name']})).Objects;
            flowName = flow?.length ? flow[0].Name : undefined;
        }
        catch(err){
            flowName = undefined;
        }
        finally{
            return flowName;
        }
     }

    getRGBAcolor(colObj: PepColorSettings, opac = null){
        let rgba = 'rgba(255,255,255,0';
            if(colObj){
                let color = colObj.value || 'hsl(0, 0%, 0%)';
                let opacity = opac != null ? opac : colObj.opacity;

                opacity = opacity > 0 ? opacity / 100 : 0;
                //check if allready rgba
                
                let hsl = this.pepColorService.hslString2hsl(color);
                let rgb = this.pepColorService.hsl2rgb(hsl);
                
                rgba = 'rgba('+ rgb.r + ','  + rgb.g + ',' + rgb.b + ',' + opacity + ')';
        }
        return rgba;
    }

    changeCursorOnDragStart() {
        document.body.classList.add('inheritCursors');
        document.body.style.cursor = 'grabbing';
    }

    changeCursorOnDragEnd() {
        document.body.classList.remove('inheritCursors');
        document.body.style.cursor = 'unset';
    }

}
