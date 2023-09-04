import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { PepColorService, PepLayoutService, PepScreenSizeType, PepSizeType, PepStyleType } from '@pepperi-addons/ngx-lib';
import { IGallery, IGalleryEditor, IHostObject, ICardEditor  } from '../../gallery.model';
import { GalleryService } from 'src/common/gallery.service';
import { PepColorSettings } from '@pepperi-addons/ngx-composite-lib/color-settings';

@Component({
    selector: 'gallery-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})

export class CardComponent implements OnInit {
   //@ViewChild('mainSlideCont', { static: true }) slideContainer: ElementRef;

    screenSize: PepScreenSizeType;
    @Input() cardIndex: number;
    @Input() GalleryConfig: IGalleryEditor;
    @Input() card : ICardEditor;
    @Input() cardWidth: string;
    @Input() showSlide: boolean;

    @Output() cardClick: EventEmitter<any> = new EventEmitter();
  //public slideIndex;

    constructor(
        public layoutService: PepLayoutService,
        private pepColorService: PepColorService,
        public translate: TranslateService,
        public galleryService: GalleryService
    ) {
        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });

    }
    
    private getDefaultHostObject(): IGallery {
        return { GalleryConfig: new IGalleryEditor(), Cards: Array<ICardEditor>() };
    }

    // getCardImageURL() {
    //        return this.card?.AssetURL !== '' ? 'url("' + this.card.AssetURL + '")' : '';
    // }

    ngOnChanges(changes) { 
        if (changes) {
        }
    }

    ngOnInit() {
    }
    
    getGalleryBorder() {
        if(this.GalleryConfig?.Card?.Border.use){
            let col: PepColorSettings = this.GalleryConfig?.Card?.Border;
            return  '1px solid ' + this.galleryService.getRGBAcolor(col);
        }
        else{
            return 'none';
        }
    }

    getGradientOverlay(){

        let gradient = this.GalleryConfig?.GradientOverlay;
        let horAlign = this.GalleryConfig?.Text?.HorizontalAlign;
        let verAlign = this.GalleryConfig?.Text?.VerticalAlign; // 'top' | 'middle' | 'bottom'
        let direction = '0';

        switch(horAlign){
            case 'left':{
                direction = verAlign === 'start' ? '135' : verAlign === 'middle' ? '90' : '45';
                break;
            }
            case 'center':{
                direction = verAlign === 'start' ? '180' : verAlign === 'middle' ? 'circle' : '0';
                break;
            }
            case 'right':{
                direction = verAlign === 'start' ? '225' : verAlign === 'middle' ? '270' : '315';
                break;
            }
        }
            direction = direction === 'circle' ? direction : direction + 'deg';

        let colorsStr =  this.galleryService.getRGBAcolor(gradient) +' , '+ this.galleryService.getRGBAcolor(gradient,0);
        let gradType = direction === 'circle' ? 'radial-gradient' : 'linear-gradient';

        let gradStr = this.GalleryConfig.GradientOverlay.use ? gradType + '(' + direction +' , '+ colorsStr +')' : '';

        if(gradStr != ''){
            return gradStr ;
        }
        else{
            return 'unset';
        }
    }

    getOrdinal(n) {
        var s = ["th ", "st ", "nd ", "rd "];
        var v = n%100;
        return n + (s[(v-20)%10] || s[v] || s[0]);
    }

    getAssetWithPos(){
        
        let imageSrc = this.card?.AssetURL !== '' ? 'url(' +this.card?.AssetURL + ')' : '';

        if(imageSrc != ''){
            return imageSrc ;
        }
        else{
            return 'unset';
        }
    }

    getOverlay(){
       return  this.GalleryConfig?.Overlay?.use ?  'inset 0 0 0 100vh ' + this.galleryService.getRGBAcolor(this.GalleryConfig?.Overlay) : 'unset' ;
    }

    onCardClicked() {
        const flowData = this.card?.Flow;
        if (flowData) {
            // Implement script click
            this.cardClick.emit(flowData);
        }
    }
}
