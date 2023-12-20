import '@pepperi-addons/cpi-node';
import GalleryCpiService from './gallery-cpi.service';
export const router:any = Router()

router.post('/on_gallery_block_load', async (req, res) => {
    let configuration = req?.body?.Configuration;
    let configurationRes = configuration;
    const state = req.body.State;
    //check if flow configured to on load --> run flow (instaed of onload event)
    if (configuration?.GalleryConfig?.OnLoadFlow){
        try{
            const cpiService = new GalleryCpiService();
            //CALL TO FLOWS AND SET CONFIGURATION
            const res: any = await cpiService.getOptionsFromFlow(configuration.GalleryConfig.OnLoadFlow, state , req.context, configuration);
            configurationRes = res?.configuration || configuration;
        }
        catch(err){
            configurationRes = configuration;
        }
    }

    if(!(await pepperi['environment'].isWebApp())) {
        const cards = configurationRes?.Cards || [] as any[];
        await Promise.all(cards.map(async (card) => {
            // overwrite the cards AssetURL with the local file path
            return card.AssetURL = await getFilePath(card)
        }))
        configurationRes.Cards = cards;
    }

    res.json({
        State: state,
        Configuration: configurationRes,
    });
});

router.post('/run_card_click_event', async (req, res) => {
    //const btnID = req.body.ButtonKey;
    const btnKey = req.body.ButtonKey;
    const state = req.body.State;
    let configuration = req?.body?.Configuration;

    let configurationRes = null;
    const btn = configuration?.Cards?.filter(card => { return card.ButtonKey === btnKey })[0] || null;
        
    // check if flow configured to on load --> run flow (instaed of onload event)
    if (btn?.Flow){
        const cpiService = new GalleryCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const result: any = await cpiService.getOptionsFromFlow(btn.Flow || [], state , req.context, configuration);
        configurationRes = result?.configuration;
    }

    res.json({
        State: state,
        Configuration: configurationRes,
    });
});

router.post('/on_block_state_change', async (req, res) => {
    const state = req.body.State || {};
    const changes = req.body.Changes || {};
    //const configuration = req.body.Configuration;

    const mergeState = {...state, ...changes};
    res.json({
        State: mergeState,
        Configuration: changes,
    });
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


