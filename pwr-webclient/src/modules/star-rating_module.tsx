import * as React from 'react';
import {CSSProperties} from 'react';
import IconButton from '@material-ui/core/Button';

import {Color} from '../utils/ColorUtil';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import {StyledComponentProps, Theme, useTheme, withStyles} from '@material-ui/core';
import {IconButtonClassKey} from '@material-ui/core/IconButton';
import {PowerLocalize} from '../localization/PowerLocalizer';

interface StarRatingProps {
    rating: number;
    /** The rating is clicked but not saved yet (#320): shown faded, the stars stay usable */
    pending?: boolean;
    /** Only shows the rating, e.g. in the profile of a colleague (#350) */
    readOnly?: boolean;

    onRatingChange?(newRating: number): void;
}

interface SingleButtonProps extends StyledComponentProps<IconButtonClassKey> {
    starRatingProps: StarRatingProps;
    position: number;
}

/**
 * Filled stars in the warning colour (5.3:1 on white), empty ones as outline, so they differ by shape as well (#201);
 * all grey for a rating out of range
 */
const getStyle = (starPosition: number, rating: number, theme: Theme): CSSProperties => {
    if (rating < 1 || rating > 5) {
        return {color: Color.HBTSilver.toCSSRGBString()};
    }
    return {color: starPosition <= rating ? theme.palette.warning.main : theme.palette.text.secondary};
};

const styles = theme => ({
    root: {
        minWidth: '0px'
    }
});

const SingleButtonBase = (props: SingleButtonProps) => {
    const {classes} = props;
    const theme = useTheme();
    const filled = props.position <= props.starRatingProps.rating;
    return <IconButton classes={{root: classes.root}}
                       size='small'
                       onClick={() => props.starRatingProps.onRatingChange(props.position)}
                       style={getStyle(props.position, props.starRatingProps.rating, theme)}>
        {filled ? <StarIcon/> : <StarBorderIcon/>}
    </IconButton>;
};

const SingleButton = withStyles(styles)(SingleButtonBase);

const ReadOnlyStars = (props: {rating: number}) => {
    const theme = useTheme();
    return <span role="img" aria-label={PowerLocalize.getFormatted('StarRating.ReadOnly', props.rating)}
                 style={{display: 'inline-flex'}}>
        {[1, 2, 3, 4, 5].map(position => position <= props.rating
            ? <StarIcon key={position} style={getStyle(position, props.rating, theme)}/>
            : <StarBorderIcon key={position} style={getStyle(position, props.rating, theme)}/>)}
    </span>;
};

export const StarRating: React.FunctionComponent<StarRatingProps> = (props: StarRatingProps) => {
    if (props.readOnly) {
        return <ReadOnlyStars rating={props.rating}/>;
    }
    return (<span style={props.pending ? {opacity: 0.5} : undefined} aria-busy={props.pending || undefined}>
            <SingleButton starRatingProps={props} position={1}/>
            <SingleButton starRatingProps={props} position={2}/>
            <SingleButton starRatingProps={props} position={3}/>
            <SingleButton starRatingProps={props} position={4}/>
            <SingleButton starRatingProps={props} position={5}/>
        </span>);
};
