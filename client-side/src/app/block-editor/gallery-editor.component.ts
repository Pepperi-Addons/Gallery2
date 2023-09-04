import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { IGallery, IGalleryEditor, ICardEditor } from '../gallery.model';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import  { GalleryService } from '../../common/gallery.service';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';
import { PageConfiguration, PapiClient } from '@pepperi-addons/papi-sdk';
import { AddonService } from "src/app/services/addon.service";
import { MatDialogRef } from '@angular/material/dialog';
import { PepAddonBlockLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';
import { FlowService } from '../services/flow.service';


@Component({
    selector: 'gallery-editor',
    templateUrl: './gallery-editor.component.html',
    styleUrls: ['./gallery-editor.component.scss']
})
export class GalleryEditorComponent implements OnInit {

    dialogRef: MatDialogRef<any>;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    currentCardindex: number;
    blockLoaded = false;
    public flowHostObject;

    @Input()
    set hostObject(value: any) {
        if (value?.configuration && Object.keys(value.configuration).length) {
                this._configuration = value.configuration;

                this.initPageConfiguration(value?.pageConfiguration);
                const page = value?.page;
                this.flowService.recalculateEditorData(page , this._pageConfiguration);

                this.flowHostObject = this.flowService.prepareFlowHostObject((value.configuration.GalleryConfig?.OnLoadFlow || null));
            if(value.configurationSource && Object.keys(value.configuration).length > 0){
                this.configurationSource = value.configurationSource;
            }
        } else {
            // TODO - NEED TO ADD DEFAULT CARD
            if(this.blockLoaded){
                this.loadDefaultConfiguration();
            }
        }
        
        this._pageParameters = value?.pageParameters || {};
    }


    public configurationSource: IGallery;

    private _configuration: IGallery;
    get configuration(): IGallery {
        return this._configuration;
    }

    // All the page parameters to set in page configuration when needed (for FlowPicker addon usage).
    private _pageParameters: any;
    get pageParameters(): any {
        return this._pageParameters;
    }

    private defaultPageConfiguration: PageConfiguration = { "Parameters": [] };
    private _pageConfiguration: PageConfiguration = this.defaultPageConfiguration;
    
    public textColor: Array<PepButton> = [];
    public verticalAlign: Array<PepButton> = [];
    public TextPositionStyling: Array<PepButton> = [];
    public GroupTitleAndDescription: Array<PepButton> = [];

    constructor(private translate: TranslateService, 
                private galleryService: GalleryService,
                private flowService: FlowService,
                private viewContainerRef: ViewContainerRef,
                private addonBlockLoaderService: PepAddonBlockLoaderService) {
                 
                }

    async ngOnInit(): Promise<void> {

        const desktopTitle = await this.translate.get('SLIDESHOW.HEIGHTUNITS_REM').toPromise();

        if (!this.configuration) {
            this.loadDefaultConfiguration();
        }
        
        this.textColor = [
            { key: 'system-primary', value:this.translate.instant('GALLERY_EDITOR.TEXT_COLOR.SYSTEM'), callback: (event: any) => this.onGalleryFieldChange('Card.TextColor',event) },
            { key: 'invert', value:this.translate.instant('GALLERY_EDITOR.TEXT_COLOR.INVERT'), callback: (event: any) => this.onGalleryFieldChange('Card.TextColor',event) }
        ]

        this.TextPositionStyling =  [
            { key: 'overlaid', value: this.translate.instant('GALLERY_EDITOR.TEXT_POSITION.OVERLAID'), callback: (event: any) => this.onGalleryFieldChange('Text.Position',event) },
            { key: 'separated', value: this.translate.instant('GALLERY_EDITOR.TEXT_POSITION.SEPARATED'), callback: (event: any) => this.onGalleryFieldChange('Text.Position',event) }
        ];

        this.GroupTitleAndDescription = [
            { key: 'grouped', value: this.translate.instant('GALLERY_EDITOR.GROUP.GROUPED'), callback: (event: any) => this.onGalleryFieldChange('Text.GroupTitleAndDescription',event) },
            { key: 'ungrouped', value: this.translate.instant('GALLERY_EDITOR.GROUP.UNGROUPED'), callback: (event: any) => this.onGalleryFieldChange('Text.GroupTitleAndDescription',event) }
        ]

        this.verticalAlign = [
            { key: 'start', value: this.translate.instant('GALLERY_EDITOR.VERTICAL_ALIGN.TOP'), callback: (event: any) => this.onGalleryFieldChange('Text.VerticalAlign',event) },
            { key: 'middle', value: this.translate.instant('GALLERY_EDITOR.VERTICAL_ALIGN.MIDDLE'), callback: (event: any) => this.onGalleryFieldChange('Text.VerticalAlign',event) },
            { key: 'end', value: this.translate.instant('GALLERY_EDITOR.VERTICAL_ALIGN.BOTTOM'), callback: (event: any) => this.onGalleryFieldChange('Text.VerticalAlign',event) }
        ]
        this.blockLoaded = true;
    }

    ngOnChanges(e: any): void {

    }
    
    private initPageConfiguration(value: PageConfiguration = null) {
        this._pageConfiguration = value || JSON.parse(JSON.stringify(this.defaultPageConfiguration));
    }

    public onHostObjectChange(event) {
        if(event && event.action) {
            if (event.action === 'set-configuration') {
                this._configuration = event.configuration;
                this.updateHostObject();

                // Update page configuration only if updatePageConfiguration
                if (event.updatePageConfiguration) {
                    this.updatePageConfigurationObject();
                }
            }
        }
    }

    private updateHostObject() {
        
        this.hostEvents.emit({
            action: 'set-configuration',
            configuration: this.configuration
        });
    }

    private updateHostObjectField(fieldKey: string, value: any) {
        this.hostEvents.emit({
            action: 'set-configuration-field',
            key: fieldKey, 
            value: value
        });
    }

    private getPageConfigurationParametersNames(): Array<string> {
        const parameters = new Set<string>();

        // Go for all Cards scripts and add parameters to page configuration if Source is dynamic.
        for (let index = 0; index < this._configuration.Cards.length; index++) {
            const card = this._configuration.Cards[index];
            
            if (card?.Flow?.runScriptData) {
                Object.keys(card.Flow.runScriptData?.ScriptData).forEach(paramKey => {
                    const param = card.Flow.runScriptData.ScriptData[paramKey];
        
                    if (!parameters.has(param.Value) && param.Source === 'dynamic') {
                        parameters.add(param.Value);
                    }
                });
            }
        }

        // Return the parameters as array.
        return [...parameters];
    }

    private updatePageConfigurationObject() {
        const params = this.getPageConfigurationParametersNames();
        this._pageConfiguration = this.defaultPageConfiguration;

        // Add the parameter to page configuration.
        for (let paramIndex = 0; paramIndex < params.length; paramIndex++) {
            const param = params[paramIndex];
            
            this._pageConfiguration.Parameters.push({
                Key: param,
                Type: 'String',
                Consume: true,
                Produce: false
            });
        }

        this.hostEvents.emit({
            action: 'set-page-configuration',
            pageConfiguration: this._pageConfiguration
        });
    }

    onGalleryFieldChange(key, event){
        const value = event && event.source && event.source.key ? event.source.key : event && event.source && event.source.value ? event.source.value :  event;

        if(key.indexOf('.') > -1){
            let keyObj = key.split('.');
            this.configuration.GalleryConfig[keyObj[0]][keyObj[1]] = value;
        }
        else{
            this.configuration.GalleryConfig[key] = value;
        }
  
        this.updateHostObjectField(`GalleryConfig.${key}`, value);

        if(key === 'Text.GroupTitleAndDescription' || key === 'Text.Position'){
            if(this.configuration?.GalleryConfig?.Text?.Position === 'separated'){
                if(this.configuration.GalleryConfig.Text.GroupTitleAndDescription ==='ungrouped'){ //disable Vertical Position (all potions)
                    this.verticalAlign[0].disabled = true;
                    this.verticalAlign[1].disabled = true;
                    this.verticalAlign[2].disabled = true;
                }
                else{ // disable Vertical Position > Middle (Top & Bottom are still available
                    this.verticalAlign[0].disabled = false;
                    this.verticalAlign[1].disabled = true;
                    this.verticalAlign[2].disabled = false;
                }
            }
            else{ // Overlaid
                    this.verticalAlign[0].disabled = false;
                    this.verticalAlign[1].disabled = false;
                    this.verticalAlign[2].disabled = false;
            }      
        }
    }

    private loadDefaultConfiguration() {
        this._configuration = this.getDefaultHostObject();
        this.updateHostObject();
        this.flowHostObject = this.flowService.prepareFlowHostObject((this.configuration?.GalleryConfig?.OnLoadFlow || null)); 
    }

    private getDefaultCards(numOfCards: number = 0): Array<ICardEditor> {
        let Cards: Array<ICardEditor> = [];
       
        for(var i=0; i < numOfCards; i++){
            let card = new ICardEditor();
            card.id = i;
            
            

            card.Title = this.getOrdinal(i+1) + this.translate.instant('GALLERY_EDITOR.ITEM');
            card.Description = this.translate.instant('GALLERY_EDITOR.AWESOMETEXTFORTHE') + ' ' + this.getOrdinal(i+1) + this.translate.instant('GALLERY_EDITOR.ITEM');
            Cards.push(card);
        }

        return Cards;
    }

    getOrdinal(n) {
        var s = ["th ", "st ", "nd ", "rd "];
        var v = n%100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
    }

    private getDefaultHostObject(): IGallery {
        return { GalleryConfig: new IGalleryEditor(), Cards: this.getDefaultCards(2) };
    }

    addNewCardClick() {
        let card = new ICardEditor();
        card.id = (this.configuration?.Cards.length);
        card.Title = this.getOrdinal(card.id+1) + this.translate.instant('GALLERY_EDITOR.ITEM');
        card.Description = this.translate.instant('GALLERY_EDITOR.AWESOMETEXTFORTHE') + ' ' + this.getOrdinal(card.id+1) + this.translate.instant('GALLERY_EDITOR.ITEM');
        
        this.configuration?.Cards.push( card); 
        this.updateHostObject();  
    }

    onCardEditClick(event){
       
        if(this.configuration?.GalleryConfig?.editSlideIndex === event.id){ //close the editor
            this.configuration.GalleryConfig.editSlideIndex = -1;
        }
        else{ 
            this.currentCardindex = this.configuration.GalleryConfig.editSlideIndex = parseInt(event.id);
        }
        this.updateHostObjectField(`GalleryConfig.editSlideIndex`, this.configuration.GalleryConfig.editSlideIndex);
        //this.cdr.detectChanges();
        //this.updateHostObject();
    }

    onCardRemoveClick(event){
        this.configuration?.Cards.splice(event.id, 1);
        this.configuration?.Cards.forEach(function(card, index, arr) {card.id = index; });
        this.updateHostObject();
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
         moveItemInArray(this.configuration.Cards, event.previousIndex, event.currentIndex);
         for(let index = 0 ; index < this.configuration.Cards.length; index++){
            this.configuration.Cards[index].id = index;
         }
          this.updateHostObject();
        } 
    }

    onDragStart(event: CdkDragStart) {
        this.galleryService.changeCursorOnDragStart();
    }

    onDragEnd(event: CdkDragEnd) {
        this.galleryService.changeCursorOnDragEnd();
    }

    onFlowChange(flowData: any) {
        const base64Flow = btoa(JSON.stringify(flowData));
        this.configuration.GalleryConfig.OnLoadFlow = base64Flow;
        this.updateHostObject();
    }
}
