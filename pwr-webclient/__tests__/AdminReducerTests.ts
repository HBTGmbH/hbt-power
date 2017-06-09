import {DatabaseReducer} from '../src/reducers/profile/DatabaseReducer';
import {AdminReducer} from '../src/reducers/admin/AdminReducer';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {APIConsultant} from '../src/model/APIProfile';
import {ReceiveAllConsultantsAction} from '../src/reducers/admin/admin-actions';
import {AdminActionCreator} from '../src/reducers/admin/AdminActionCreator';
import {InternalDatabase} from '../src/model/InternalDatabase';
import {ConsultantInfo} from '../src/model/ConsultantInfo';
import {AdminState} from '../src/model/admin/AdminState';
import {isNullOrUndefined} from 'util';


test('Dispatches an ReceiveAllConsultants action on an empty state.', () => {
    console.log(AdminReducer);
    let store = createStore(
        combineReducers({
            databaseReducer: DatabaseReducer.Reduce,
            adminReducer: AdminReducer.reduce
        }),
        applyMiddleware(
            thunkMiddleware
        )
    );
    // Construct some API consultants.
    let apiConsultants: Array<APIConsultant> = [
        {profile: null, title: "Dr. Phil.", initials: "jd",  lastName: "Doe", firstName: "John"},
        {profile: null, title: "Dr. Rer. Nat.", initials: "jdo",  lastName: "Doe", firstName: "Jane"}
    ];
    let consultants: Array<ConsultantInfo> = apiConsultants.map(api => ConsultantInfo.fromAPI(api));
    let action: ReceiveAllConsultantsAction = AdminActionCreator.ReceiveAllConsultants(consultants);
    store.dispatch(action);
    let states: any = store.getState() as any;
    // Make sure that the database part of the store is still in its original state.
    expect(states.databaseReducer).toEqual(InternalDatabase.createWithDefaults());
    // Make sure that the admin part contains the two consultants
    let adminStore: AdminState = states.adminReducer;
    expect(isNullOrUndefined(adminStore)).toBeFalsy();
    let consultantsByInitials = adminStore.consultantsByInitials();
    expect(consultantsByInitials).toContainEqual(consultants[0]);
    expect(consultantsByInitials).toContainEqual(consultants[1]);

});