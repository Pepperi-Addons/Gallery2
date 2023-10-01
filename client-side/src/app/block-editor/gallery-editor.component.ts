import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { IGallery, IGalleryEditor, ICardEditor, IEditorHostObject, Card } from '../gallery.model';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import  { GalleryService } from '../../common/gallery.service';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';
import { Page, PageConfiguration, PapiClient } from '@pepperi-addons/papi-sdk';
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
    set hostObject(value: IEditorHostObject) {
        if (value?.configuration && Object.keys(value.configuration).length) {
                this._configuration = value.configuration;
            if(value.configurationSource && Object.keys(value.configuration).length > 0){
                this.configurationSource = value.configurationSource;
            }
            this.flowHostObject = this.flowService.prepareFlowHostObject((value.configuration.GalleryConfig?.OnLoadFlow || null));
        } else {
            // TODO - NEED TO ADD DEFAULT CARD
            if(this.blockLoaded){
                this.loadDefaultConfiguration();
            }
        }

        this.initPageConfiguration(value?.pageConfiguration);
        this._page = value?.page;
        this.flowService.recalculateEditorData(this._page, this._pageConfiguration); 
    }

    private _page: Page;
    get page(): Page {
        return this._page;
    }

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
    
    public configurationSource: IGallery;
    public textColor: Array<PepButton> = [];
    public verticalAlign: Array<PepButton> = [];
    public TextPositionStyling: Array<PepButton> = [];
    public GroupTitleAndDescription: Array<PepButton> = [];

    constructor(private translate: TranslateService, 
                private galleryService: GalleryService,
                private flowService: FlowService,) {}

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
    }

    onCardRemoveClick(event){
        this.configuration?.Cards.splice(event.id, 1);
        this.configuration?.Cards.forEach(function(card, index, arr) {card.id = index; });
        this.updateHostObject();
    }

    onCardDuplicateClick(event){
        let card = new ICardEditor();
        card = JSON.parse(JSON.stringify(this.configuration.Cards[event.id]));

        card.id = (this.configuration?.Cards.length);
        this.configuration?.Cards.push(card);
        this._configuration = this.configuration
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

      /***************   FLOW AND CONSUMER PARAMETERS START   ********************************/
      onFlowChange(flowData: any) {
        const base64Flow = btoa(JSON.stringify(flowData));
        this.configuration.GalleryConfig.OnLoadFlow = base64Flow;
        this.updateHostObject();
        this.updatePageConfigurationObject();
    }

    onCardFlowChanged(event: any) {
        this.updatePageConfigurationObject();
    }

    private initPageConfiguration(value: PageConfiguration = null) {
        this._pageConfiguration = value || JSON.parse(JSON.stringify(this.defaultPageConfiguration));
    }

    private updatePageConfigurationObject() {
        this.initPageConfiguration();
    
        // Get the consume parameters keys from the filters.
        const consumeParametersKeys = this.getConsumeParametersKeys();
        this.addParametersToPageConfiguration(consumeParametersKeys, false, true);
        
        // After adding the params to the page configuration need to recalculate the page parameters.
        this.flowService.recalculateEditorData(this._page, this._pageConfiguration);

        this.emitSetPageConfiguration();
    }

    private getConsumeParametersKeys(): Map<string, string> {
        const parametersKeys = new Map<string, string>();

        // Move on onload flows
        const onLoadFlow = this.configuration?.GalleryConfig?.OnLoadFlow || null;
        if (onLoadFlow) {
            let flowParams = JSON.parse(atob(onLoadFlow)).FlowParams;
            Object.keys(flowParams).forEach(key => {
                const param = flowParams[key];
                if (param.Source === 'Dynamic') {
                    parametersKeys.set(param.Value, param.Value);
                }
            });
        }
        
        // Move on all the gallery cards flows.
        for (let index = 0; index < this.configuration?.Cards?.length; index++) {
            const btn = this.configuration.Cards[index];
            if (btn?.Flow) {
                const flowParams = JSON.parse(atob(btn.Flow)).FlowParams || null;
                Object.keys(flowParams).forEach(key => {
                    const param = flowParams[key];
                    if (param.Source === 'Dynamic') {
                        parametersKeys.set(param.Value, param.Value);
                    }
                });
            }
        }

        return parametersKeys;
    }

    private addParametersToPageConfiguration(paramsMap: Map<string, string>, isProduce: boolean, isConsume: boolean) {
        const params = Array.from(paramsMap.values());

        // Add the parameters to page configuration.
        for (let index = 0; index < params.length; index++) {
            const parameterKey = params[index];
            if(parameterKey !== 'configuration'){
                const paramIndex = this._pageConfiguration.Parameters.findIndex(param => param.Key === parameterKey);

                // If the parameter exist, update the consume/produce.
                if (paramIndex >= 0) {
                    this._pageConfiguration.Parameters[paramIndex].Consume = this._pageConfiguration.Parameters[paramIndex].Consume || isConsume;
                    this._pageConfiguration.Parameters[paramIndex].Produce = this._pageConfiguration.Parameters[paramIndex].Produce || isProduce;
                } else {
                    // Add the parameter only if not exist.
                    this._pageConfiguration.Parameters.push({
                        Key: parameterKey,
                        Type: 'String',
                        Consume: isConsume,
                        Produce: isProduce
                    });
                }
            }
        }
    }

    private emitSetPageConfiguration() {
        this.hostEvents.emit({
            action: 'set-page-configuration',
            pageConfiguration: this._pageConfiguration
        });
    }
    /***************   FLOW AND CONSUMER PARAMETERS END   ********************************/
}
