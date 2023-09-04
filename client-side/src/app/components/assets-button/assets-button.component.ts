import { TranslateService } from '@ngx-translate/core';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { PepAddonBlockLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';

@Component({
    selector: 'assets-button',
    templateUrl: './assets-button.component.html',
    styleUrls: ['./assets-button.component.scss']
})

export class AssetsButtonComponent implements OnInit {
   
    @ViewChild('assetsBtnCont', { static: false }) assetsBtnCont: ElementRef;
    // @ViewChild('addonLoaderContainer', { read: ViewContainerRef }) addonLoaderContainer: ViewContainerRef;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    @Input() imageURL: string = '';

    assetsHostObject = {
        selectionType: 'single',
        allowedAssetsTypes: 'images',
        inDialog: true
    }

    constructor(
        private viewContainerRef: ViewContainerRef,
        public translate: TranslateService,
        private addonBlockLoaderService: PepAddonBlockLoaderService) {

    }

    ngOnChanges(changes) { 
        if (changes) {
        }
    }

    ngOnInit() {

    }

    onOpenAssetsDialog() {
        const dialogRef = this.addonBlockLoaderService.loadAddonBlockInDialog({
            container: this.viewContainerRef,
            name: 'AssetPicker',
            hostObject: this.assetsHostObject,
            hostEventsCallback: (event) => { this.onHostEvents(event, dialogRef); }
        });
    }

    onHostEvents(event: any, dialogRef) {
        this.hostEvents.emit(event);

        if (dialogRef) {
            dialogRef.close(null);
        }
    }
}
