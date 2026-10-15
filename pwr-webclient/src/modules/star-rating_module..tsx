import * as React from 'react';
import {CSSProperties} from 'react';
import IconButton from '@material-ui/core/Button';

import {Color} from '../utils/ColorUtil';
import StarIcon from '@material-ui/icons/Star';
import {StyledComponentProps, withStyles} from '@material-ui/core';
import {IconButtonClassKey} from '@material-ui/core/IconButton';

interface StarRatingProps {
    rating: number;

    onRatingChange(newRating: number): void;
}

interface SingleButtonProps extends StyledComponentProps<IconButtonClassKey> {
    starRatingProps: StarRatingProps;
    position: number;
}

const styleYellow: CSSProperties = {
    color: Color.HBT_2017_HIGHLIGHT.toCSSRGBString()
};

const styleDefault: CSSProperties = {
    color: 'initial'
};

const styleUnused: CSSProperties = {
    color: Color.HBTSilver.toCSSRGBString()
};

const getStyle = (starPosition: number, rating: number) => {
    if (rating < 1 || rating > 5) {
        return styleUnused;
    } else {
        if (starPosition <= rating) {
            return styleYellow;
        } else {
            return styleDefault;
        }
    }
};

const styles = theme => ({
    root: {
        minWidth: '0px'
    }
});

const SingleButtonBase = (props: SingleButtonProps) => {
    const {classes} = props;
    return <IconButton classes={{root: classes.root}}
                       size='small'
                       onClick={() => props.starRatingProps.onRatingChange(props.position)}
                       style={getStyle(props.position, props.starRatingProps.rating)}><StarIcon/></IconButton>;
};

const SingleButton = withStyles(styles)(SingleButtonBase);

export const StarRating: React.FunctionComponent<StarRatingProps> = (props: StarRatingProps) => {
    return (<span>
            <SingleButton starRatingProps={props} position={1}/>
            <SingleButton starRatingProps={props} position={2}/>
            <SingleButton starRatingProps={props} position={3}/>
            <SingleButton starRatingProps={props} position={4}/>
            <SingleButton starRatingProps={props} position={5}/>
        </span>);
};
