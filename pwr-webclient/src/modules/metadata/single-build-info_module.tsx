import * as React from 'react';
import {BuildInfo} from '../../model/metadata/BuildInfo';

interface SingleBuildInfoProps {
    buildInfo: BuildInfo;
}

export const SingleBuildInfo = (props: SingleBuildInfoProps) =>  (props.buildInfo.available() ?
<span>
    <span className="build-info-highlight">{props.buildInfo.name()}</span>
    <span className="build-info-normal"> version </span>
    <span className="build-info-highlight">{props.buildInfo.version()}</span>
    <span className="build-info-normal"> built on </span>
    <span className="build-info-highlight">{props.buildInfo.time().toUTCString()}</span>
</span> :
<span>
    <span className="build-info-highlight">{props.buildInfo.name()}</span>
    <span className="build-info-normal"> is </span>
    <span className="build-info-offline">unavailable </span>
</span>
);