import * as redux from 'redux';
import {ApplicationState} from '../reducerIndex';
import {suggestionUpdateAction} from './actions/SuggestionUpdateAction';
import {SuggestionField} from './model/SuggestionField';
import {SuggestionServiceClient} from './client/SuggestionServiceClient';
import {skillSuggestionUpdateAction} from './actions/SkillSuggestionUpdateAction';

const client = SuggestionServiceClient.instance();

export class SuggestionAsyncActionCreator {


    public static requestAllNameEntities() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            dispatch(SuggestionAsyncActionCreator.requestQualifications());
            dispatch(SuggestionAsyncActionCreator.requestLanguages());
            dispatch(SuggestionAsyncActionCreator.requestEducations());
            dispatch(SuggestionAsyncActionCreator.requestTrainings());
            dispatch(SuggestionAsyncActionCreator.requestSectors());
            dispatch(SuggestionAsyncActionCreator.requestCompanies());
            dispatch(SuggestionAsyncActionCreator.requestProjectRoles());
            dispatch(SuggestionAsyncActionCreator.requestKeySkills());
            dispatch(SuggestionAsyncActionCreator.requestCareers());
        };
    }

    public static requestLanguages() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getLanguageSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allLanguages' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestEducations() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getEducationSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allEducations' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestQualifications() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getQualificationSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allQualifications' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestTrainings() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getTrainingSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allTrainings' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestSectors() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getSectorSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allIndustrialSectors' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestKeySkills() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getKeySkillSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allSpecialFields' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestCareers() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getCareerSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allCareers' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestProjectRoles() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getProjectRoleSuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allProjectRoles' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestCompanies() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getCompanySuggestions()
                .then(payload => {
                    dispatch(suggestionUpdateAction('allCompanies' as SuggestionField, payload));
                })
                .catch(console.error);
        };
    }

    public static requestAllSkills() {
        return function (dispatch: redux.Dispatch<ApplicationState>) {
            client.getSkillSuggestions()
                .then(payload => {
                    dispatch(skillSuggestionUpdateAction(payload));
                })
                .catch(console.error);
        };
    }
}