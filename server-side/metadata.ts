import config from '../addon.config.json';
import { AddonDataScheme, Relation } from '@pepperi-addons/papi-sdk';

export const blockName = 'Gallery2';

export const DimxRelations: Relation[] = [{
    AddonUUID: config.AddonUUID,
    Name: `${blockName}`,
    RelationName: 'DataImportResource',
    Type: 'AddonAPI',
    Description: `${blockName} Import Relation`,
    FixRelativeURL: '/api/dimx_import',
    AddonRelativeURL: ''
},
{
    AddonUUID: config.AddonUUID,
    Name: `${blockName}`,
    RelationName: 'DataExportResource',
    Type: 'AddonAPI',
    Description: `${blockName} Export Relation`,
    AddonRelativeURL: '/api/dimx_export'
}];

export const GalleryScheme: AddonDataScheme = {
    Name: blockName,
    Type: 'data',
    Fields: {
        GalleryConfig: {
            Type: "Object"
        },
        Cards: {
            Type: 'Array',
            Items: {
                Type: 'Object',
                Fields: {
                    AssetKey: {
                        Type: "Resource",
                        Resource: "Assets", // todo - need to change to resource adal table name
                        AddonUUID: "ad909780-0c23-401e-8e8e-f514cc4f6aa2",
                    }
                }
            }
        }
    }
}

