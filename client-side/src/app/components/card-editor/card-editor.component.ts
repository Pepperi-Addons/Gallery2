import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PepStyleType, PepSizeType} from '@pepperi-addons/ngx-lib';
import { PepDialogActionButton, PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import { IGallery } from 'src/app/gallery.model';
import { MatDialogRef } from '@angular/material/dialog';
import { FlowService } from 'src/app/services/flow.service';
import { IPepMenuItemClickEvent, PepMenuItem } from '@pepperi-addons/ngx-lib/menu';

interface groupButtonArray {
    key: string; 
    value: string;
}

@Component({
    selector: 'card-editor',
    templateUrl: './card-editor.component.html',
    styleUrls: ['./card-editor.component.scss']
})
export class CardEditorComponent implements OnInit, AfterViewInit{

    @Input() configuration: IGallery;
    @Input() id: string;

    public title: string;
    public flowHostObject;

    @Input() isDraggable = false;
    @Input() showActions = true;
    @Input() selectedCardIndex = -1;

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    @Output() removeClick: EventEmitter<any> = new EventEmitter();
    @Output() editClick: EventEmitter<any> = new EventEmitter();
    @Output() duplicateClick: EventEmitter<any> = new EventEmitter();
    @Output() flowChange: EventEmitter<any> = new EventEmitter();

    dialogRef: MatDialogRef<any>;
    actiosMenu: Array<PepMenuItem> = [];
    
    constructor (
        private translate: TranslateService,
        private flowService: FlowService) {
    }

    async ngOnInit(): Promise<void> {
        const desktopTitle = await this.translate.get('SLIDESHOW.HEIGHTUNITS_REM').toPromise();  
        
        this.actiosMenu = [
            { key: 'duplicate', text: this.translate.instant('IMAGE_EDITOR.DUPLICATE') },
            { key: 'delete', text: this.translate.instant('IMAGE_EDITOR.DELETE') }
        ]
    }

    ngAfterViewInit(): void {
        this.flowHostObject = this.flowService.prepareFlowHostObject((this.configuration?.Cards[this.id]['Flow'] || null)); 
    }

    getOrdinal(n) {
        var s = ["th ", "st ", "nd ", "rd "];
        var v = n%100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
    }

    onMenuItemClick(item: IPepMenuItemClickEvent){
        if(item?.source?.key == 'delete'){
            this.removeClick.emit({id: this.id});
        }
        else if(item?.source?.key == 'duplicate'){
            this.duplicateClick.emit({id: this.id});
        }
    }

    onEditClick() {
        this.editClick.emit({id: this.id});
    }

    onCardFieldChange(key, event){
        const value = key.indexOf('image') > -1 && key.indexOf('src') > -1 ? event.fileStr :  event && event.source && event.source.key ? event.source.key : event && event.source && event.source.value ? event.source.value :  event;
  
        if(key.indexOf('.') > -1){
            let keyObj = key.split('.');
            this.configuration.Cards[this.id][keyObj[0]][keyObj[1]] = value;
        }
        else{
            this.configuration.Cards[this.id][key] = value;
        }

        this.updateHostObject();
    }

    private updateHostObject(updatePageConfiguration = false) {
        this.hostEvents.emit({
            action: 'set-configuration',
            configuration: this.configuration,
            updatePageConfiguration: updatePageConfiguration
        });
    }

    onHostEvents(event: any) {
        if(event?.url) {
            this.configuration.Cards[this.id].AssetURL = event.url;
            this.configuration.Cards[this.id].AssetKey = event.key;

            this.updateHostObject();
        }     
    }

    onFlowChange(flowData: any) {
        const base64Flow = btoa(JSON.stringify(flowData));
        this.configuration.Cards[this.id]['Flow'] = base64Flow;
        this.updateHostObject(true);
        this.flowChange.emit();
    }
}

