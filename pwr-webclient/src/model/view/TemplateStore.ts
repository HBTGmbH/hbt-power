import {doop} from 'doop';
import * as Immutable from 'immutable';
import {Template} from './Template';


@doop
export class TemplateStore{
    @doop public get templates(){return doop<Immutable.Map<string, Template>,this>()};

    private constructor(){
        return this;
    }

    public static empty() : TemplateStore{
        return new TemplateStore().templates(Immutable.Map<string,Template>());
    }
}