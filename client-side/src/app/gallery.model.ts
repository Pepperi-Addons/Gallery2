import { PepHorizontalAlignment, PepSizeType} from "@pepperi-addons/ngx-lib";
import { PepShadowSettings} from "@pepperi-addons/ngx-composite-lib/shadow-settings";
import { PepColorSettings } from "@pepperi-addons/ngx-composite-lib/color-settings";
export type textColor = 'system-primary' | 'dimmed' | 'invert' | 'strong';
export type verticalAlignment = 'start' | 'middle' | 'end';
export type textPositionStyling = 'overlaid' | 'separated';
export type groupTitleAndDescription = 'grouped' | 'ungrouped';
export type FontWeight = 'regular' | 'bold' | 'bolder';

export interface IHostObject {
    configuration: IGallery;
    parameters: any;
    // pageConfiguration?: PageConfiguration;
    // pageType?: any;
    // context?: any;
    // filter?: any;
}

export interface IGallery{
    GalleryConfig: IGalleryEditor,
    Cards: Array<ICardEditor>
}

export class Gallery{
    MaxColumns: number = 2;
    Gap: PepSizeType = 'md';
    FillHeight: boolean = false;
}

export class Card {
    Height: number = 16;
    TextColor: textColor = 'system-primary';
    Border: PepColorSettings = new PepColorSettings();
    DropShadow: PepShadowSettings = new PepShadowSettings();
    UseRoundCorners: boolean = true;
    RoundCornersSize: PepSizeType = 'md';
}

export class Text {
    Use: boolean = true;
    Position: textPositionStyling = 'overlaid';
    VerticalAlign: verticalAlignment  = 'middle';
    HorizontalAlign: PepHorizontalAlignment = 'center';
    GroupTitleAndDescription: groupTitleAndDescription = 'grouped';
}

export class Title {
    Use: boolean;
    Size: PepSizeType;
    Weight: FontWeight;
    InnerSpacing: PepSizeType;
    MaxNumOfLines: number;

    constructor(use = true, size: PepSizeType = 'lg', weight: FontWeight = 'regular', spacing: PepSizeType = 'sm', numOfLines = 1){
        this.Use = use;
        this.Size = size;
        this.Weight = weight;
        this.InnerSpacing = spacing;
        this.MaxNumOfLines = numOfLines;
    }
}

export class IGalleryEditor {
    OnLoadFlow: any;
    Gallery: Gallery = new Gallery();
    Card: Card = new Card();
    Text: Text = new Text();
    Title: Title = new Title();
    Description: Title = new Title(true, 'md', 'regular', 'sm', 1);
    Overlay: PepColorSettings = new PepColorSettings(true, 'hsl(190, 100%, 50%)', 75);
    GradientOverlay: PepColorSettings  = new PepColorSettings(true, 'hsl(0, 0%, 90%)', 75);

    //maxColumns: number = 2;
    //gap: PepSizeType = 'md';
    //fillHeight: boolean = false;
    //border: PepColorSettings = new PepColorSettings();
    //cardHeight: number = 16;
    //cardTextColor: textColor = 'system-primary';
    //useText: boolean = true;
    //textPosition: textPositionStyling = 'overlaid';
    //verticalAlign: verticalAlignment  = 'middle';
    //horizontalAlign: PepHorizontalAlignment = 'center';
    
    //useTitle: boolean = true;
    //titleSize: PepSizeType = 'lg';
    //titleWeight: FontWeight = 'regular';
    //titleInnerSpacing: PepSizeType = 'sm';
    //useDescription: boolean = true;
    //descriptionSize: PepSizeType = 'md';
    //descriptionInnerSpacing: PepSizeType = 'sm';
    //descriptionMaxNumOfLines: number = 1;
    //groupTitleAndDescription: groupTitleAndDescription = 'grouped';
    //overlay: PepColorSettings = new PepColorSettings(true, 'hsl(190, 100%, 50%)', 75);
    //gradientOverlay: PepColorSettings  = new PepColorSettings(true, 'hsl(0, 0%, 90%)', 75);
    editSlideIndex: number = -1;

    //dropShadow: PepShadowSettings = new PepShadowSettings();
    //useRoundCorners: boolean = true;
    //roundCornersSize: PepSizeType = 'md';
}

export class ICardEditor {
    id: number;
    Title: string = "defaultTitle";
    Description: string = "defaultDescription";
    AssetKey: string = '';
    AssetURL: string = '';
    Flow: any;
    //title: string = "defaultTitle";
    //description: string = "defaultDescription";
    //asset: string = '';
    //AssetURL: string = '';
    //script: any;
}
