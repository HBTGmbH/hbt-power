import {ReceiveNotificationsAction} from '../src/reducers/admin/admin-actions';
import {AdminNotification} from '../src/model/admin/AdminNotification';
import {AdminActionCreator} from '../src/reducers/admin/AdminActionCreator';
import {AdminReducer} from '../src/reducers/admin/AdminReducer';
import {RequestStatus} from '../src/Store';
import {APIProfileEntryNotification, ProfileEntryNotification} from '../src/model/admin/ProfileEntryNotification';
const apiNotification1: APIProfileEntryNotification = {
    nameEntity: {
        type: "SECTOR",
        name: "Test1",
        id: 1
    },
    id: 1,
    type: "TestNotification",
    profileEntryId: 1,
    occurrence: new Date().toISOString(),
    initials: "mm",
    reason: "Broken"
};

const apiNotification2: APIProfileEntryNotification = {
    nameEntity: {
        type: "COMPANY",
        name: "Test2",
        id: 2
    },
    id: 13,
    type: "TestNotification",
    profileEntryId: 1,
    occurrence: new Date().toISOString(),
    initials: "mm",
    reason: "Broken"
};

const apiNotification3: APIProfileEntryNotification = {
    nameEntity: {
        type: "SECTOR",
        name: "Test3",
        id: 4
    },
    id: 14,
    type: "TestNotification",
    profileEntryId: 1,
    occurrence: new Date().toISOString(),
    initials: "mm",
    reason: "Broken"
};


test('Validates that the AdminReducer implements correct behaviour for an ReceiveNotificationsAction action and an undefined initial store', () => {
    // Create the test notifications
    let apiNotifications = [apiNotification1, apiNotification2, apiNotification3];
    // Create the test action
    let action: ReceiveNotificationsAction = AdminActionCreator.ReceiveNotifications(apiNotifications);
    // Create an empty state
    let testState = AdminReducer.reduce(undefined, {type: null});
    // Reduce with the action
    testState = AdminReducer.reduce(testState, action);
    // State should contain 3 notifications. Check based on their IDs
    expect(testState.profileEntryNotifications()).toContainEqual(ProfileEntryNotification.fromAPI(apiNotification1));
    expect(testState.profileEntryNotifications()).toContainEqual(ProfileEntryNotification.fromAPI(apiNotification2));
    expect(testState.profileEntryNotifications()).toContainEqual(ProfileEntryNotification.fromAPI(apiNotification3));
    // State should not contain more than 3 elements
    expect(testState.profileEntryNotifications().count()).toEqual(3);
    // Response status is successful
    expect(testState.requestStatus()).toEqual(RequestStatus.Successful);
});


test('Validates that the AdminReducer implements correct behaviour for an ReceiveNotificationsAction action with already present notifications', () => {
    // Create the test notifications (initial)
    let apiNotificationsInitial = [apiNotification1, apiNotification2];
    // Create the overriding notifications
    let apiNotificationsOverriding = [apiNotification3];
    // Create the initial action
    let action: ReceiveNotificationsAction = AdminActionCreator.ReceiveNotifications(apiNotificationsInitial);
    // Create an empty state
    let testState = AdminReducer.reduce(undefined, {type: null});
    // Reduce with the action; Valid behaviour is tested by another test for this case
    testState = AdminReducer.reduce(testState, action);
    // Create the overriding action
    let actionOverriding: ReceiveNotificationsAction = AdminActionCreator.ReceiveNotifications(apiNotificationsOverriding);
    testState = AdminReducer.reduce(testState, actionOverriding);
    expect(testState.profileEntryNotifications()).toContainEqual(AdminNotification.fromAPI(apiNotification3));
    expect(testState.profileEntryNotifications().count()).toEqual(1);
    // Response status is successful
    expect(testState.requestStatus()).toEqual(RequestStatus.Successful);
});

test('Validates that the AdminReducer throws an exception when a ReceiveNotificationAction with null or undefined notifications is used', () => {
    let invalidAction: ReceiveNotificationsAction = AdminActionCreator.ReceiveNotifications(null);
    let testState = AdminReducer.reduce(undefined, {type: null});
    expect(() => {
        testState = AdminReducer.reduce(testState, invalidAction);
    }).toThrowError(TypeError);
});

test('Validates that the AdminReducer implements correct behaviour for an ReceiveNotificationsAction(trashed) action and an undefined initial store', () => {
    // Create the test notifications
    let apiNotifications = [apiNotification1, apiNotification2, apiNotification3];
    // Create the test action
    let action: ReceiveNotificationsAction = AdminActionCreator.ReceiveTrashedNotifications(apiNotifications);
    // Create an empty state
    let testState = AdminReducer.reduce(undefined, {type: null});
    // Reduce with the action
    testState = AdminReducer.reduce(testState, action);
    // State should contain 3 notifications. Check based on their IDs
    expect(testState.trashedNotifications()).toContainEqual(AdminNotification.fromAPI(apiNotification1));
    expect(testState.trashedNotifications()).toContainEqual(AdminNotification.fromAPI(apiNotification2));
    expect(testState.trashedNotifications()).toContainEqual(AdminNotification.fromAPI(apiNotification3));
    // State should not contain more than 3 elements
    expect(testState.trashedNotifications().count()).toEqual(3);
    // Response status is successful
    expect(testState.requestStatus()).toEqual(RequestStatus.Successful);
});

test('Validates that the AdminReducer implements correct behaviour for an ReceiveNotificationsAction(trashed) action with already present notifications', () => {
    // Create the test notifications (initial)
    let apiNotificationsInitial = [apiNotification1, apiNotification2];
    // Create the overriding notifications
    let apiNotificationsOverriding = [apiNotification3];
    // Create the initial action
    let action: ReceiveNotificationsAction = AdminActionCreator.ReceiveTrashedNotifications(apiNotificationsInitial);
    // Create an empty state
    let testState = AdminReducer.reduce(undefined, {type: null});
    // Reduce with the action; Valid behaviour is tested by another test for this case
    testState = AdminReducer.reduce(testState, action);
    // Create the overriding action
    let actionOverriding: ReceiveNotificationsAction = AdminActionCreator.ReceiveTrashedNotifications(apiNotificationsOverriding);
    testState = AdminReducer.reduce(testState, actionOverriding);
    expect(testState.trashedNotifications()).toContainEqual(AdminNotification.fromAPI(apiNotification3));
    expect(testState.trashedNotifications().count()).toEqual(1);
    // Response status is successful
    expect(testState.requestStatus()).toEqual(RequestStatus.Successful);
});
