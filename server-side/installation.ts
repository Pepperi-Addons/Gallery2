
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { Relation } from '@pepperi-addons/papi-sdk'
import MyService from './my.service';
import { blockName, DimxRelations, GalleryScheme } from './metadata';

// export async function install(client: Client, request: Request): Promise<any> {
//     const res = await runMigration(client);
//     return res;
// }

export async function install(client: Client, request: Request): Promise<any> {

    const galleryRelationsRes = await runMigration(client);
    const dimxRes = await createDimxRelations(client);
    const dimxSchemeRes = await addDimxScheme(client);
   
    return {
        success: galleryRelationsRes.success && dimxRes.success && dimxSchemeRes.success,
        errorMessage: `galleryRelationsRes: ${galleryRelationsRes.errorMessage}, userDeviceResourceRes: ${dimxRes.errorMessage}, userDeviceResourceRes: ${dimxSchemeRes.errorMessage}`
    };
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    const galleryRelationsRes = await runMigration(client);
    const dimxRes = await createDimxRelations(client);
    const dimxSchemeRes = await addDimxScheme(client);
   
    return {
        success: galleryRelationsRes.success && dimxRes.success && dimxSchemeRes.success,
        errorMessage: `galleryRelationsRes: ${galleryRelationsRes.errorMessage}, userDeviceResourceRes: ${dimxRes.errorMessage}, userDeviceResourceRes: ${dimxSchemeRes.errorMessage}`
    };
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

async function runMigration(client){
    try {
        const pageComponentRelation: Relation = {
            RelationName: "PageBlock",
            Name: blockName,
            Description: `${blockName} block`,
            Type: "NgComponent",
            SubType: "NG14",
            AddonUUID: client.AddonUUID,
            AddonRelativeURL: `file_${client.AddonUUID}`,
            ComponentName: `${blockName}Component`,
            ModuleName: `${blockName}Module`,
            EditorComponentName: `${blockName}EditorComponent`,
            EditorModuleName: `${blockName}EditorModule`,
            ElementsModule: 'WebComponents',
            ElementName: `gallery-element-${client.AddonUUID}`,
            EditorElementName: `gallery-editor-element-${client.AddonUUID}`,
            Schema: {
                "Fields": {
                    "GalleryConfig": {
                        "Type": "Object",
                        "Fields": { // Gallery.MaxColumns
                            "Gallery": {
                                "Type": "Object",
                                "Fields": { 
                                    "MaxColumns": {
                                        "Type": "Integer",
                                        "ConfigurationPerScreenSize": true
                                    },
                                    "Gap": {
                                        "Type": "Integer",
                                        "ConfigurationPerScreenSize": true
                                    }
                                }
                            },
                            "Card": {
                                "Type": "Object",
                                "Fields": { 
                                    "Height": {
                                        "Type": "Integer",
                                        "ConfigurationPerScreenSize": true
                                    }
                                }
                            },
                            "Text": {
                                "Type": "Object",
                                "Fields": { 
                                    "Position": {
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    },
                                    "VerticalAlign": {
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    },
                                    "HorizontalAlign": {
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    },
                                    "GroupTitleAndDescription": {
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    }

                                }
                            },
                            "Title": {
                                "Type": "Object",
                                "Fields": { 
                                    "Size": {
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    },
                                    "InnerSpacing":{
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    }
                                }
                            },
                            "Description": {
                                "Type": "Object",
                                "Fields": { 
                                    "Size": {
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    },
                                    "InnerSpacing":{
                                        "Type": "String",
                                        "ConfigurationPerScreenSize": true
                                    },
                                    "MaxNumOfLines": {
                                        "Type": "Integer",
                                        "ConfigurationPerScreenSize": true
                                    }
                                }
                            }  
                        }
                    }
                }
            },
            //OnPageLoadEndpoint: "/addon-cpi/prepare_assets",
            BlockLoadEndpoint: "/addon-cpi/on_gallery_block_load",
            BlockButtonClickEndpoint: "/addon-cpi/run_card_click_event",
        };

        const service = new MyService(client);
        const result = await service.upsertRelation(pageComponentRelation);
        return {success:true, errorMessage: '' };
    } catch(e) {
        return { success: false, errorMessage: e || '' };
    }
}

async function createDimxRelations(client) {
    
    let relations: Relation[] = DimxRelations;
    let relationName = '';

    try {
        const service = new MyService(client);

        relations.forEach(async (relation) => {
            relationName = relation.RelationName;
            const result = await service.upsertRelation(relation);
        });
        return {
            success: true,
            errorMessage: ''
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: relationName + ' ' + (err ? err : 'Unknown Error Occured'),
        }
    }
}

async function addDimxScheme(client) {
    try {
        const service = new MyService(client);
        service.papiClient.addons.data.schemes.post(GalleryScheme);
        return {
            success: true,
            errorMessage: ''
        }
    }
    catch (err) {
            return {
                success: false,
                errorMessage: `Error in creating gallery scheme for dimx . error - ${err}`
            }
    }
}