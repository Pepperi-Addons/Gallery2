import '@pepperi-addons/cpi-node';
import GalleryCpiService from './gallery-cpi.service';
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

router.post('/run_card_click_event', async (req, res) => {
    let configuration = req?.body?.Configuration;
    const state = req.body.State;
    const btnID = req.body.ButtonKey;
    // check if flow configured to on load --> run flow (instaed of onload event)
    if (configuration?.Cards[btnID]?.Flow){
        const cpiService = new GalleryCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const result: any = await cpiService.getOptionsFromFlow(configuration.Cards[btnID].Flow || [], state , req.context, configuration);
        configuration = result?.configuration || configuration;
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


export async function load(configuration: any) {
    
}


