import {ActionType} from '../ActionType';
import {TemplateActions} from './TemplateActions';
import {Template} from '../../model/view/Template';
import {AbstractAction} from '../profile/database-actions';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {TemplateService} from '../../API_CONFIG';
import {CrossCuttingActionCreator} from '../crosscutting/CrossCuttingActionCreator';

export namespace TemplateActionCreator {
    import SetTemplateAction = TemplateActions.SetTemplateAction;
    import RemoveTemplateAction = TemplateActions.RemoveTemplateAction;
    import CreateTemplateAction = TemplateActions.CreateTemplateAction;
    import ChangeTemplateAction = TemplateActions.ChangeTemplateAction;

    /**
     * speichert ein template - local
     * @param {Template} template
     * @returns {TemplateActions.SetTemplateAction}
     * @constructor
     */
    export function SetTemplate(template: Template) : SetTemplateAction{
        return {
            type: ActionType.SetTemplate,
            template: template,
        }
    }

    /**
     * entfernt ein template - local
     * @param {string} id
     * @returns {TemplateActions.RemoveTemplateAction}
     * @constructor
     */
    export function RemoveTemplate(id: string) : RemoveTemplateAction{
        return {
            type: ActionType.SetTemplate,
            id: id
        }
    }

    /**
     * loescht die gespeicherten templates - local
     * @returns {AbstractAction}
     * @constructor
     */
    export function ClearTemplates(): AbstractAction{
        return {
            type: ActionType.ClearTemplates,
        }
    }

    export function CreateTemplate(name:string,description:string, initials:string, path:string):CreateTemplateAction{
        return {
            type: ActionType.CreateTemplate,
            name: name,
            description: description,
            initials:initials,
            path:path,
        }
    }

    export function ChangeTemplate(template:TemplateSlice):ChangeTemplateAction{
        return{
            type:ActionType.ChangeTemplate,
            id:             template.id,
            name:           template.name,
            description:    template.description,
            path:           template.path,
        }
    }

    /*  TEMPLATES  by mp*/

    /**
     * Fuegt ein vom view-service empfangenes Template dem TemplateState hinzu
     *
     * @param {AxiosResponse} response : die Response des view-service
     * @param {Dispatch<ApplicationState>} dispatch
     * @constructor
     */
    function TemplateReceived(response: AxiosResponse, dispatch: redux.Dispatch<ApplicationState>) {
        let template: Template = new Template(response.data);
        dispatch(SetTemplate(template));
    }

    function AsyncChangeTemplate(templateSlice:TemplateSlice){
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState){
            axios.patch(TemplateService.ChangeTemplate(templateSlice.id),{
                name:templateSlice.name,
                description:templateSlice.description,
                path:templateSlice.path,
            })
                .then((response:AxiosResponse) => {TemplateReceived(response,dispatch)})
                .catch((error: AxiosError) => {
                    dispatch(ProfileActionCreator.APIRequestFailed());
                    console.error(error);
                });
        }
    }


    function AsyncCreateTemplate(name:string, description:string, initials:string, path:string){
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState){
            axios.post(TemplateService.CreateTemplate(name),{
                description:description,
                path:path,
                createUser:initials,
            })
                .then((response:AxiosResponse) => {TemplateReceived(response,dispatch)})
                .catch((error: AxiosError) => {
                    dispatch(ProfileActionCreator.APIRequestFailed());
                    console.error(error);
                });
        }
    }

    function AsyncLoadTemplate(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            dispatch(CrossCuttingActionCreator.startRequest());
            axios.get(TemplateService.getTemplateById(id)).then((response: AxiosResponse) => {
                //console.log(response.data);
                TemplateReceived(response, dispatch);
                dispatch(CrossCuttingActionCreator.endRequest());
            }).catch((error: AxiosError) => {
                dispatch(CrossCuttingActionCreator.endRequest());
                console.error(error);
            });
        }
    }

    export function AsyncLoadAllTemplates() {
        return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState){
            dispatch(CrossCuttingActionCreator.startRequest());
            dispatch(ClearTemplates());
            axios.get(TemplateService.getTemplates()).then((response: AxiosResponse) => {
                let ids: Array<string> = response.data;
                ids.forEach(id => dispatch(AsyncLoadTemplate(id)))
                dispatch(CrossCuttingActionCreator.endRequest());
            }).catch(function (error: any) {
                console.error(error);
                dispatch(CrossCuttingActionCreator.endRequest());
            });
        }
    }


    export function AsyncLoadPreview(id:string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            axios.get(TemplateService.getPreview(id))// url adresse
                .then((response:AxiosResponse) => {
                   // PreviewReceived(id,response.data, dispatch);      // in den state laden
                })
                .catch(function (error:any) {
                    console.error(error);
                });
        }
    }
}