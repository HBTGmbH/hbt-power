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
}