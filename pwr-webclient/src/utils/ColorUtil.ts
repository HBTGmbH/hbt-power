/**
 * Color that wraps around a CSS color description to allow linear interpolation between colors.
 */
import {isNullOrUndefined} from 'util';

export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    public static readonly Green: Color = new Color(0, 255, 0, 255);
    public static readonly Red: Color = new Color(255, 0, 0, 255);
    public static readonly Light_Red: Color = new Color(255, 204, 203);

    public static readonly HBTBlue: Color = new Color(0, 100, 152, 255);
    public static readonly HBTAnthrazit: Color = new Color(85, 85, 91, 255);
    public static readonly HBTSilver: Color = new Color(225, 223, 221, 255);

    public static readonly HBT_2017_TEXT_WHITE: Color = new Color(255, 255, 255);
    public static readonly HBT_2017_TEXT_BLACK: Color = new Color(0, 0, 0);

    public static readonly HBT_2017_DARK_BLUE: Color = new Color(25, 30, 85);
    public static readonly HBT_2017_SPOT_COLOR_1: Color = new Color(70, 230, 230);
    public static readonly HBT_2017_SPOT_COLOR_2: Color = new Color(95, 110, 240);
    public static readonly HBT_2017_GRAY: Color = new Color(140, 140, 170);
    public static readonly HBT_2017_BLACK: Color = new Color(0, 0, 0);
    public static readonly HBT_2017_MEDIUM_BLUE = new Color(60, 60, 110);
    public static readonly HBT_2017_LIGHT_BLUE = new Color(80, 90, 200);

    public static readonly HBT_2017_HIGHLIGHT = new Color(255, 142, 1);

    public static readonly HBT_2017_WHITE = new Color(255, 255, 255);

    constructor(r: number, g: number, b: number, a?: number) {
        this.r = Math.round(r);
        this.g = Math.round(g);
        this.b = Math.round(b);
        if (isNullOrUndefined(a)) {
            a = 1.0;
        }
        this.a = Math.round(a);
    }

    /**
     * Lerps two colors.
     * @param a
     * @param b
     * @param t
     * @returns {Color}
     * @constructor
     */
    public static LERP(a: Color, b: Color, t: number): Color {
        return new Color
        (
            a.r + (b.r - a.r) * t,
            a.g + (b.g - a.g) * t,
            a.b + (b.b - a.b) * t,
            a.a + (b.a - a.a) * t
        );
    }


    public toCSSRGBString(): string {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    }

    public toCSSRGBAString(alpha: number | string) {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ',' + alpha + ')';
    }
}