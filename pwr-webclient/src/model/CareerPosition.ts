/**
 * A single career position. This represents one of the company's possible positions.
 * Positions may not be arbitrary, a fixed set of positions exist that may be requested via an API.
 */
export interface CareerPosition {
    id: number;
    position: string;
}