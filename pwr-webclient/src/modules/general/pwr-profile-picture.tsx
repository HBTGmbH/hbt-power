import * as React from 'react';
import {useEffect, useState} from 'react';
import {Avatar} from '@material-ui/core';
import {AvatarProps} from '@material-ui/core/Avatar/Avatar';
import {ProfileServiceClient} from '../../clients/ProfileServiceClient';

/**
 * Blob URLs of the profile pictures currently shown, by picture id. Several components showing the same picture (e.g.
 * toolbar and page) share one request and one URL. The URL is revoked shortly after the last of them is gone; the
 * delay keeps it across a re-mount (navigation, React strict mode).
 */
interface CachedPicture {
    pictureId: string;
    url: Promise<string | null>;
    users: number;
    revokeTimer?: ReturnType<typeof setTimeout>;
}

const RELEASE_DELAY_MS = 5000;
const pictures = new Map<string, CachedPicture>();

function forget(picture: CachedPicture) {
    if (pictures.get(picture.pictureId) === picture) {
        pictures.delete(picture.pictureId);
    }
}

function acquire(pictureId: string): CachedPicture {
    let picture = pictures.get(pictureId);
    if (!picture) {
        const url = ProfileServiceClient.instance().getProfilePicture(pictureId)
            .then(blob => blob ? URL.createObjectURL(blob) : null);
        const created: CachedPicture = {pictureId, url, users: 0};
        // A failed request is not cached, the next component showing the picture tries again
        url.catch(() => forget(created));
        picture = created;
        pictures.set(pictureId, picture);
    }
    clearTimeout(picture.revokeTimer);
    picture.users++;
    return picture;
}

function release(picture: CachedPicture) {
    picture.users--;
    if (picture.users > 0) {
        return;
    }
    picture.revokeTimer = setTimeout(() => {
        forget(picture);
        picture.url.then(url => url && URL.revokeObjectURL(url), () => undefined);
    }, RELEASE_DELAY_MS);
}

/**
 * Blob URL of a profile picture, null while it loads, if there is none or if it cannot be loaded.
 */
export function useProfilePicture(pictureId: string | null | undefined): string | null {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        setUrl(null);
        if (!pictureId) {
            return undefined;
        }
        let current = true;
        const picture = acquire(pictureId);
        picture.url
            .then(loaded => current && setUrl(loaded))
            .catch(() => undefined);
        return () => {
            current = false;
            release(picture);
        };
    }, [pictureId]);
    return url;
}

interface PwrProfilePictureProps extends Omit<AvatarProps, 'src' | 'srcSet' | 'children'> {
    /** Id of the picture; without one, or while it loads, a neutral placeholder is shown */
    pictureId: string | null | undefined;
}

/**
 * Profile picture of a consultant. Loaded with the token through {@link ProfileServiceClient}, since the edge only
 * delivers it to logged-in users. Forwards its ref, so it can be wrapped in a Tooltip.
 */
export const PwrProfilePicture = React.forwardRef<HTMLDivElement, PwrProfilePictureProps>(
    ({pictureId, ...avatarProps}, ref) => {
        const url = useProfilePicture(pictureId);
        return <Avatar ref={ref} {...avatarProps} src={url ?? undefined}/>;
    });
