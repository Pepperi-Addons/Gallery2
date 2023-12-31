import { TranslateService } from '@ngx-translate/core';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IGallery, IHostObject } from '../gallery.model';
import  { GalleryService } from '../../common/gallery.service';
import { PepLayoutService } from '@pepperi-addons/ngx-lib';

@Component({
    selector: 'gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss']
})

export class GalleryComponent implements OnInit {
    
    @Input()
    set hostObject(value: IHostObject) {
        if(value?.configuration && Object.keys(value.configuration).length){
            this.configuration = value?.configuration;
        }
        
        this._parameters = value?.parameters || {};
            //check if MaxColumns has been changed , and calc the cards width;
            //if(this.configuration && this.configuration.GalleryConfig.Gallery.MaxColumns !== value?.configuration?.GalleryConfig.Gallery.MaxColumns){
                   this.setCardWidth();
            //}
    }

    private _parameters: any;

    private _configuration: IGallery;
    get configuration(): IGallery {
        return this._configuration;
    }
    set configuration(conf: IGallery){
        this._configuration = conf;
    }

    public cardWidth: string;

    @ViewChild('galleryContainer', { static: true }) galleryContainer: ElementRef;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();

    constructor(private translate: TranslateService, 
                private galleryService: GalleryService, 
                private layoutService: PepLayoutService ) { }

    @HostListener('window:resize')
    public onWindowResize() {
        this.setCardWidth();
    }

    async ngOnInit(): Promise<void> {
        this.hostEvents.emit({
            action: 'register-state-change',
            callback: this.registerStateChange.bind(this)
        });

        this.setCardWidth();
    }

    ngOnChanges(e: any): void {
   
    }
    
    private registerStateChange(data: {state: any, configuration: any}) {
        if(!this.configuration && data?.configuration){
            this.configuration = data.configuration;
        }
        else if(data?.configuration){
            this.mergeConfiguration(data.configuration);
        }
        this.setCardWidth();
    }
    
    private mergeConfiguration(newConfiguration){
        
        for (const prop in this.configuration) {
            // skip loop if the property dont exits on new object
            if (!newConfiguration.hasOwnProperty(prop)) continue;
            //update configuration with the object from new object
            this.configuration[prop] = newConfiguration[prop]; 
        }
    }
    setCardWidth(){
        const gap = this.configuration?.GalleryConfig?.Gallery?.Gap || 'none';
        const maxColumns = this.configuration?.GalleryConfig?.Gallery?.MaxColumns || 1;
        const spacing = gap == 'none' ? '0px' : '(var(--pep-spacing-'+ gap +') * '+ (maxColumns - 1) +')';

        this.cardWidth = 'calc((100%  - 2px - '+ spacing +' ) / '+ maxColumns +' )';
    }

    counter(i: number) {
        return new Array(i);
    }

    private getScriptParams(scriptData: any) {
        const res = {};
        
        if (scriptData) {
            // Go for all the script data and parse the params.
            Object.keys(scriptData).forEach(paramKey => {
                const scriptDataParam = scriptData[paramKey];
                
                // If the param source is dynamic get the value from the _parameters with the param value as key, else it's a simple param.
                if (scriptDataParam.Source === 'dynamic') {
                    res[paramKey] = this._parameters[scriptDataParam.Value] || '';
                } else { // if (scriptDataParam.Source === 'static')
                    res[paramKey] = scriptDataParam.Value;
                }
            });
        }

        return res;
    }
    onCardClicked(event) {
         //check if card has flow
         const card = this.configuration?.Cards[event];
         if(card?.Flow){
            this.hostEvents.emit({
                action: 'button-click',
                buttonKey: card.ButtonKey
            })
        }
    }
}
