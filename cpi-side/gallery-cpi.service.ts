import { Client, Context, IClient, IContext } from '@pepperi-addons/cpi-node/build/cpi-side/events';
import { CLIENT_ACTION_ON_GALLERY_CARD_CLICK } from 'shared';
import { AddonUUID } from '../addon.config.json';
import { FlowObject, RunFlowBody } from '@pepperi-addons/cpi-node';

class GalleryCpiService {
    
    constructor() {}

    /***********************************************************************************************/
    //                              Private functions
    /************************************************************************************************/
    
    private async getGallery(headerKey: string): Promise<any> {
     

        return {};
    }
    
    public  async getOptionsFromFlow(flowStr: string, state: any, context: IContext | undefined, configuration = {}): Promise<any> {
        const flowData: FlowObject = flowStr?.length ? JSON.parse(Buffer.from(flowStr, 'base64').toString('utf8')) : {};
        
        if (flowData?.FlowKey?.length > 0) {
            const dynamicParamsData: any = {};
            
            if (flowData.FlowParams) {
                const dynamicParams: any = [];
                

                // Get all dynamic parameters to set their value on the data property later.
                const keysArr = Object.keys(flowData.FlowParams);
                for (let index = 0; index < keysArr.length; index++) {
                    const key = keysArr[index];
                    
                    if (flowData.FlowParams[key].Source === 'Dynamic') {
                        dynamicParams.push(flowData.FlowParams[key].Value);
                    }
                }
                
                // Set the dynamic parameters values on the dynamicParamsData property.
                for (let index = 0; index < dynamicParams.length; index++) {
                    const param = dynamicParams[index];
                    dynamicParamsData[param] = param === 'configuration' ? configuration : state[param] || '';
                }
            }
            const flowToRun: RunFlowBody = {
                RunFlow: flowData,
                Data: dynamicParamsData,
                context: context
            };
            // Run the flow and return the options.
            const flowRes = await pepperi.flows.run(flowToRun);
            return flowRes;
        }
        else{
            return {};
        }

        
    }
     /***********************************************************************************************/
    //                              Public functions
    /************************************************************************************************/


}
export default GalleryCpiService;