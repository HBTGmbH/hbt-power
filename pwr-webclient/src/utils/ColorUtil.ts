/**
 * Color that wraps around a CSS color description to allow linear interpolation between colors.
 */
export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    public static readonly Green: Color = new Color(0, 255, 0, 255);
    public static readonly Red: Color = new Color(255, 0, 0, 255);

    public static readonly HBTBlue : Color = new Color(0, 100, 152, 255);
    public static readonly HBTAnthrazit : Color = new Color(85, 85, 91, 255);
    public static readonly HBTSilver: Color = new Color(225, 223, 221, 255);

    constructor(r: number, g: number, b: number, a: number) {
        this.r = Math.round(r);
        this.g = Math.round(g);
        this.b = Math.round(b);
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
    public static LERP(a: Color, b: Color, t: number) : Color {
        return new Color
        (
            a.r + (b.r - a.r) * t,
            a.g + (b.g - a.g) * t,
            a.b + (b.b - a.b) * t,
            a.a + (b.a - a.a) * t
        );
    }


    public toCSSRGBString() : string {
       return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    }
}