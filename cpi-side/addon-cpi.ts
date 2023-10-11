import '@pepperi-addons/cpi-node';
import GalleryCpiService from './gallery-cpi.service';
export const router:any = Router()
import * as _ from 'lodash'

router.post('/on_gallery_block_load', async (req, res) => {
    let configuration = req?.body?.Configuration;
    let configurationRes = configuration;
    const state = req.body.State;
    //check if flow configured to on load --> run flow (instaed of onload event)
    if (configuration?.GalleryConfig?.OnLoadFlow){
        const cpiService = new GalleryCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const res: any = await cpiService.getOptionsFromFlow(configuration.GalleryConfig.OnLoadFlow, state , req.context, configuration);
        configurationRes = res?.configuration || configuration;
    }

    if(!(await pepperi['environment'].isWebApp())) {
        const cards = configurationRes?.Cards || [] as any[];
        await Promise.all(cards.map(async (card) => {
            // overwrite the cards AssetURL with the local file path
            return card.AssetURL = await getFilePath(card)
        }))
        configurationRes.Cards = cards;
    }

    const difference = _.differenceWith(_.toPairs(configurationRes), _.toPairs(configuration), _.isEqual);
    difference.forEach(diff => {
        state[diff[0]] = diff[1];
    });

    res.json({
        State: state,
        Configuration: configurationRes,
    });
});

router.post('/run_card_click_event', async (req, res) => {
    const btnID = req.body.ButtonKey;
    const state = req.body.State;
    let configuration = req?.body?.Configuration;

    for (var prop in configuration) {
        // skip loop if the property dont exits on state object
        if (!state.hasOwnProperty(prop)) continue;
        //update configuration with the object from state
        configuration[prop] = state[prop]; 
    }

    let configurationRes = configuration;

    // check if flow configured to on load --> run flow (instaed of onload event)
    if (configuration?.Cards[btnID]?.Flow){
        const cpiService = new GalleryCpiService();
        //CALL TO FLOWS AND SET CONFIGURATION
        const result: any = await cpiService.getOptionsFromFlow(configuration.Cards[btnID].Flow || [], state , req.context, configuration);
        configurationRes = result?.configuration || configuration;
    }
    
    const difference = _.differenceWith(_.toPairs(configurationRes), _.toPairs(configuration), _.isEqual);
    difference.forEach(diff => {
        state[diff[0]] = diff[1];
    });

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


