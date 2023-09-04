import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from '../components/card/card.module';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepAddonService, PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { PepColorModule } from '@pepperi-addons/ngx-lib/color';

import { config } from '../addon.config';
import { GalleryService } from '../../common/gallery.service';
import { GalleryComponent } from './gallery.component';

@NgModule({
    declarations: [GalleryComponent],
    imports: [
        CommonModule,
        CardModule,
        PepNgxLibModule,
        PepColorModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }, isolate: false
        }),
    ],
    exports: [GalleryComponent],
    providers: [
        TranslateStore,
        // Add here all used services.
        GalleryService
    ]
})
export class GalleryModule {
    constructor(
        translate: TranslateService,
        private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
    }
}
