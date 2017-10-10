import * as React from 'react';
import {CSSProperties} from 'react';
import {IconButton} from 'material-ui';
import {Color} from '../utils/ColorUtil';

interface StarRatingProps {
    rating: number;
    onRatingChange(newRating: number): void;
}

interface StarRatingState {

}

const styleYellow: CSSProperties = {
    color: Color.HBT_2017_HIGHLIGHT.toCSSRGBString()
};

const styleDefault: CSSProperties = {
    color: "initial"
};

const getStyle = (starPosition: number, rating: number) => {
    if(starPosition <= rating) {
        return styleYellow;
    } else {
        return styleDefault;
    }
};



export const StarRating: React.SFC<StarRatingProps> = (props: StarRatingProps) => (<span>
            <IconButton  onClick={() => props.onRatingChange(1)} iconClassName="material-icons" iconStyle={getStyle(1, props.rating)}>star_rate</IconButton>
            <IconButton  onClick={() => props.onRatingChange(2)} iconClassName="material-icons" iconStyle={getStyle(2, props.rating)}>star_rate</IconButton>
            <IconButton  onClick={() => props.onRatingChange(3)} iconClassName="material-icons" iconStyle={getStyle(3, props.rating)}>star_rate</IconButton>
            <IconButton  onClick={() => props.onRatingChange(4)} iconClassName="material-icons" iconStyle={getStyle(4, props.rating)}>star_rate</IconButton>
            <IconButton  onClick={() => props.onRatingChange(5)} iconClassName="material-icons" iconStyle={getStyle(5, props.rating)}>star_rate</IconButton>
        </span>);
