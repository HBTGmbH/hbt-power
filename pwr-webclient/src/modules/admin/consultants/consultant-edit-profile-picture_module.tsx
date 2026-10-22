import * as React from 'react';
import {useRef, useState} from 'react';
import Dropzone from 'react-dropzone';
import {CircularProgress, Icon, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {ProfileServiceClient} from '../../../clients/ProfileServiceClient';
import {PwrProfilePicture} from '../../general/pwr-profile-picture';
import {PwrButton} from '../../general/pwr-button';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

/** The picture of the dialog, round like on the profile */
export const CONSULTANT_PICTURE_SIZE = 160;

const useStyles = makeStyles(theme => ({
    column: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: CONSULTANT_PICTURE_SIZE,
    },
    picture: {
        width: CONSULTANT_PICTURE_SIZE,
        height: CONSULTANT_PICTURE_SIZE,
    },
    loading: {
        width: CONSULTANT_PICTURE_SIZE,
        height: CONSULTANT_PICTURE_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    drop: {
        width: CONSULTANT_PICTURE_SIZE,
        height: CONSULTANT_PICTURE_SIZE,
        boxSizing: 'border-box',
        padding: theme.spacing(2),
        borderRadius: '50%',
        border: '2px dashed ' + theme.palette.grey[400],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        color: theme.palette.text.secondary,
        '&:hover, &:focus-visible': {
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            outline: 'none',
        },
    },
    dropActive: {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
    },
}));

export interface ConsultantEditProfilePictureProps {
    profilePictureId: string;

    onProfilePictureIdChange(profilePictureId: string): void;
}

/**
 * Picture of a consultant in the edit and create dialog (#195): the round picture with a button to remove it below,
 * or, without a picture, a round field to drop one into or to choose one by click or keyboard.
 */
export const ConsultantEditProfilePicture = (props: ConsultantEditProfilePictureProps) => {
    const classes = useStyles();
    const [uploading, setUploading] = useState(false);
    const dropzone = useRef<any>(null);

    const upload = (files: Array<File>) => {
        if (files.length === 0) {
            return;
        }
        setUploading(true);
        ProfileServiceClient.instance()
            .uploadProfilePicture(files[0])
            .then(pictureId => props.onProfilePictureIdChange(pictureId))
            .finally(() => setUploading(false));
    };

    const remove = () => {
        setUploading(true);
        ProfileServiceClient.instance()
            .deleteProfilePicture(props.profilePictureId)
            .then(() => props.onProfilePictureIdChange(''))
            .finally(() => setUploading(false));
    };

    if (uploading) {
        return <div className={classes.column}>
            <div className={classes.loading}><CircularProgress/></div>
        </div>;
    }
    if (props.profilePictureId) {
        return <div className={classes.column}>
            <PwrProfilePicture pictureId={props.profilePictureId} className={classes.picture}
                               alt={PowerLocalize.get('ConsultantEdit.Picture')}/>
            <PwrSpacer size="tight"/>
            <PwrButton color="primary" text={PowerLocalize.get('ConsultantEdit.RemovePicture')}
                       icon={<Icon className="material-icons">delete</Icon>} onClick={remove}/>
        </div>;
    }
    return <div className={classes.column}>
        {/* The field is a button of its own: Tab reaches it, Enter and space open the file selection */}
        <Dropzone ref={dropzone} onDrop={upload} multiple={false} accept="image/*"
                  className={classes.drop} activeClassName={classes.dropActive}
                  role="button" tabIndex={0} aria-label={PowerLocalize.get('ConsultantEdit.DropPicture')}
                  onKeyDown={(event: React.KeyboardEvent) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          dropzone.current?.open();
                      }
                  }}>
            <Icon className="material-icons" fontSize="large">add_a_photo</Icon>
            <PwrSpacer size="tight"/>
            <Typography variant="body2">{PowerLocalize.get('ConsultantEdit.DropPicture')}</Typography>
        </Dropzone>
    </div>;
};
