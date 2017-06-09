import * as React from 'react';

interface UnderConstructionProps {

}

interface UnderConstructionState {

}

export class UnderConstruction extends React.Component<UnderConstructionProps, UnderConstructionState> {

    render() {
        return (<div width={400} height={400}>
            <img className="img-responsive" src="/img/under_construction.svg"/>
        </div>);
    }
}
