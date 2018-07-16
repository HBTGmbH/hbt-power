import {ActionType} from '../ActionType';
import {TemplateActions} from './TemplateActions';
import {Template} from '../../model/view/Template';
import {AbstractAction} from '../profile/database-actions';
import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {AxiosError, AxiosResponse} from 'axios';
import {ProfileActionCreator} from '../profile/ProfileActionCreator';
import {TemplateService} from '../../API_CONFIG';
import axios from 'axios';

export namespace TemplateActionCreator {
    import SetTemplateAction = TemplateActions.SetTemplateAction;
    import RemoveTemplateAction = TemplateActions.RemoveTemplateAction;

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
        //console.log("TEST TEST TEST --- CLEAR TEMPLATES");
        return {
            type: ActionType.ClearTemplates,
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
        dispatch(ProfileActionCreator.SucceedAPIRequest());
    }

    function AsyncLoadTemplate(id: string) {
        return function (dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState) {
            axios.get(TemplateService.getTemplateById(id)).then((response: AxiosResponse) => {
                console.log(response.data);
                TemplateReceived(response, dispatch);
            }).catch((error: AxiosError) => {
                dispatch(ProfileActionCreator.APIRequestFailed());
                console.error(error);
            });
        }
    }

    export function AsyncLoadAllTemplates() {
        return function(dispatch: redux.Dispatch<ApplicationState>, getState: () => ApplicationState){
            dispatch(ProfileActionCreator.APIRequestPending());
            dispatch(ClearTemplates());
            axios.get(TemplateService.getTemplates()).then((response: AxiosResponse) => {
                console.log("templates response:   " + response);
                let ids: Array<string> = response.data;
                ids.forEach(id => dispatch(AsyncLoadTemplate(id)))
            }).catch(function (error: any) {
                console.error(error);
                dispatch(ProfileActionCreator.APIRequestFailed());
            });
        }
    }
}