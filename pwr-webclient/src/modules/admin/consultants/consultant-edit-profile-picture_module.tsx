import * as React from 'react';
import Dropzone from 'react-dropzone';
import {ProfileServiceClient} from '../../../clients/ProfileServiceClient';
import {Avatar} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import RemoveIcon from '@material-ui/icons/Remove';
import CircularProgress from '@material-ui/core/CircularProgress';


export interface ConsultantEditProfilePictureProps {
    profilePictureId: string;

    onProfilePictureIdChange(profilePictureId: string): void;
}

interface LocalState {
    uploading: boolean;
}

export class ConsultantEditProfilePicture extends React.Component<ConsultantEditProfilePictureProps, LocalState> {

    constructor(props: ConsultantEditProfilePictureProps) {
        super(props);
        this.state = {
            uploading: false
        }
    }

    private setUploading = (uploading: boolean) => {
        this.setState({uploading});
    }

    private handleFileDrop = (files: Array<File>) => {
        this.setUploading(true);
        if (files.length > 0) {
            ProfileServiceClient.instance()
                .uploadProfilePicture(files[0])
                .then(pictureId => this.props.onProfilePictureIdChange(pictureId))
                .then(() => this.setUploading(false));
        }
    }

    private handleDeleteProfilePicture = () => {
        this.setUploading(true);
        ProfileServiceClient.instance()
            .deleteProfilePicture(this.props.profilePictureId)
            .then(() => this.props.onProfilePictureIdChange(""))
            .then(() => this.setUploading(false));
    }

    private renderDropzone = () => {
        if (!this.props.profilePictureId && !this.state.uploading) {
            return <Dropzone onDrop={this.handleFileDrop}
                             multiple={false}>

            </Dropzone>
        }
        return <React.Fragment/>
    }

    private renderAvatar = () => {
        if (!!this.props.profilePictureId && !this.state.uploading) {
            const url = ProfileServiceClient.instance().getProfilePictureUrl(this.props.profilePictureId);
            return <div style={{width: '200px', height: '200px'}}>
                <Avatar src={url} style={{width: '100%', height: '100%'}}/>
                <Fab color="primary"
                     aria-label="remove-consultant-picture"
                     onClick={this.handleDeleteProfilePicture}
                     style={{position: 'relative', bottom: '60px', left: '160px'}}>
                    <RemoveIcon />
                </Fab>
            </div>
        }
        return <React.Fragment/>
    }

    private renderLoading = () => {
        if (this.state.uploading) {
            return <div style={{width: '200px', height: '200px'}} className="vertical-align">
                <CircularProgress />
            </div>
        }
        return <React.Fragment/>
    }

    render() {
        return <div>
            <Typography variant="subtitle1" gutterBottom>
                Profilbild
            </Typography>
            {this.renderLoading()}
            {this.renderDropzone()}
            {this.renderAvatar()}
        </div>
    }
}
