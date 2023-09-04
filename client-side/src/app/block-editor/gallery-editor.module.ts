import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PepAddonService, PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { MatTabsModule } from '@angular/material/tabs';
import { PepSliderModule } from '@pepperi-addons/ngx-lib/slider';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { PepGroupButtonsModule } from '@pepperi-addons/ngx-lib/group-buttons';
import { PepColorModule } from '@pepperi-addons/ngx-lib/color';
import { PepImageModule } from '@pepperi-addons/ngx-lib/image';
import { PepTextareaModule, } from '@pepperi-addons/ngx-lib/textarea';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { pepIconTextAlignCenter, pepIconTextAlignLeft, pepIconTextAlignRight, pepIconArrowBackRight, pepIconArrowBackLeft, pepIconArrowBack, pepIconArrowLeftAlt,pepIconArrowDown, pepIconArrowUp, PepIconModule, pepIconNumberPlus, PepIconRegistry, pepIconSystemBin, pepIconSystemBolt, pepIconSystemClose, pepIconSystemEdit, pepIconSystemMove } from '@pepperi-addons/ngx-lib/icon';
import { CardEditorModule } from '../components/card-editor/card-editor.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepShadowSettingsModule } from '@pepperi-addons/ngx-composite-lib/shadow-settings';
import { PepColorSettingsModule } from '@pepperi-addons/ngx-composite-lib/color-settings';
import { PepGroupButtonsSettingsModule } from '@pepperi-addons/ngx-composite-lib/group-buttons-settings';
import { PepNgxCompositeLibModule } from '@pepperi-addons/ngx-composite-lib';
import { config } from '../addon.config';
import { GalleryService } from '../../common/gallery.service';
import { FlowService } from '../services/flow.service';
import { PepFlowPickerButtonModule } from '@pepperi-addons/ngx-composite-lib/flow-picker-button';
import { PepFieldTitleModule } from '@pepperi-addons/ngx-lib/field-title';
import { GalleryEditorComponent } from './gallery-editor.component';

const pepIcons = [
    pepIconTextAlignCenter, 
    pepIconTextAlignLeft, 
    pepIconTextAlignRight, 
    pepIconArrowBackRight, 
    pepIconArrowBackLeft,
    pepIconArrowBack,
    pepIconSystemClose,
    pepIconNumberPlus,
    pepIconSystemBolt,
    pepIconSystemEdit,
    pepIconSystemMove,
    pepIconSystemBin,
    pepIconArrowLeftAlt,
    pepIconArrowDown,
    pepIconArrowUp
];

@NgModule({
    declarations: [GalleryEditorComponent],
    imports: [
        CommonModule,
        PepButtonModule,
        PepFlowPickerButtonModule,
        PepFieldTitleModule,
        PepSliderModule,
        CardEditorModule,
        PepNgxLibModule,
        PepColorModule,
        PepTextboxModule,
        PepSelectModule,
        PepCheckboxModule,
        PepPageLayoutModule,
        PepGroupButtonsModule,
        MatTabsModule,
        PepColorModule,
        PepImageModule,
        PepTextareaModule,
        DragDropModule,
        PepShadowSettingsModule,
        PepColorSettingsModule,
        PepGroupButtonsSettingsModule,
        PepNgxCompositeLibModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }, isolate: false
        }),
    ],
    exports: [GalleryEditorComponent],
    providers: [
        TranslateStore,
        // Add here all used services.
        GalleryService,
        FlowService
    ]
})
export class GalleryEditorModule {
    constructor(
        translate: TranslateService,
        private pepIconRegistry: PepIconRegistry,
        private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}

