import '@pepperi-addons/cpi-node';
import GalleryCpiService from './gallery-cpi.service';
import { CLIENT_ACTION_ON_GALLERY_CARD_CLICK } from 'shared';
export const router:any = Router()

router.post('/on_gallery_block_load', async (req, res) => {
    let configuration = req?.body?.Configuration;
    const state = req.body.State;

    // check if flow configured to on load --> run flow (instaed of onload event)
    if (configuration?.GalleryConfig?.OnLoadFlow){
        const cpiService = new GalleryCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const result: any = await cpiService.getOptionsFromFlow(configuration.GalleryConfig.OnLoadFlow || [], state , req.context, configuration);
        configuration = result?.configuration || configuration;
    }

    if(!(await pepperi['environment'].isWebApp())) {
        const cards = configuration?.Cards || [] as any[];
        await Promise.all(cards.map(async (card) => {
            // overwrite the cards AssetURL with the local file path
            return card.AssetURL = await getFilePath(card)
        }))
        configuration.Cards = cards;
    }
    res.json({Configuration: configuration}); 
});



async function getFilePath(card) {
    let fileUrl;

    const assetKey = card.AssetKey;
    try {
        const res = await pepperi.addons.pfs.uuid("ad909780-0c23-401e-8e8e-f514cc4f6aa2").schema("Assets").key(assetKey).get();
        fileUrl = res.URL;
    }
    catch (error) {
        fileUrl = card.AssetURL;        
    }

    return fileUrl;
}

function fixURLIfNeeded(url) {
    // "'https://pfs.pepperi.com/2234563d-b17b-4ace-b836-916b039504ae/ad909780-0c23-401e-8e8e-f514cc4f6aa2/Assets/nof3.jpeg'"
    // remove the ' from the start and the end of the string only if they exist
    if (url.startsWith("'") && url.endsWith("'")) {
        url = url.substring(1, url.length - 1);
    }
    return url;
}

export async function load(configuration: any) {
    
}
/**********************************  client events starts /**********************************/
pepperi.events.intercept(CLIENT_ACTION_ON_GALLERY_CARD_CLICK as any, {}, async (data): Promise<any> => {
    const cpiService = new GalleryCpiService();
    const res: any = await cpiService.getOptionsFromFlow(data.flow, data.parameters, data, data.parameters.configuration);
    return res;
});
/***********************************  client events ends /***********************************/

