import {ActionType} from '../ActionType';

export interface DeferrableAsyncAction {
    type: ActionType;
    asyncAction: () => any;
}
