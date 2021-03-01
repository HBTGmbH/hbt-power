import * as React from 'react';
import {BuildInfo} from '../../model/metadata/BuildInfo';

interface SingleBuildInfoProps {
    buildInfo: BuildInfo;
}


const BuildInfoAvailable = (props: SingleBuildInfoProps) => {
    const content = <span>
        <span className="build-info-highlight">{props.buildInfo.name()}</span>
        <span className="build-info-normal"> version </span>
        <span className="build-info-highlight">{props.buildInfo.version()}</span>
        <span className="build-info-normal"> built on </span>
        <span className="build-info-highlight">{props.buildInfo.time().toUTCString()}</span>
    </span>
    if (props.buildInfo.swaggerRef()) {
        return <a href={props.buildInfo.swaggerRef()} target="_blank">{content}</a>
    }
    return content;
}

const BuildInfoUnavailable = (props: SingleBuildInfoProps) => <span>
    <span className="build-info-highlight">{props.buildInfo.name()}</span>
    <span className="build-info-normal"> is </span>
    <span className="build-info-offline">unavailable </span>
</span>

export const SingleBuildInfo = (props: SingleBuildInfoProps) => {
    if (props.buildInfo.available()) {
        return <BuildInfoAvailable buildInfo={props.buildInfo}/>
    }
    return <BuildInfoUnavailable buildInfo={props.buildInfo}/>
}
