import {ApplicationState} from '../reducerIndex';
import {MiddlewareAPI} from 'redux';
import {ActionType} from '../ActionType';

/**
 * Thise piece of middleware is supposed to allow deferring of async action.
 *
 * If you want to defer an async action, wrap the redux-thunk action into {@link DeferrableAsyncAction}.
 * The action deferring middleware triggers before this middleware, potentially deferring it.
 * If the action is not supposed to be deferred, this middleware will unwrap it, allowing it to be handled by redux-thunk.
 * @param api
 */
export const asyncActionUnWrapper = (api: MiddlewareAPI) => (next) => (action): any => {
    // No async action available -> dont do anything
    if (!action.asyncAction) {
        next(action);
    } else {
        // Async action. Unwrap it and throw it into next.
        next(action.asyncAction);
    }
};

/**
 * This is one of the typical typescript hacks. It turns any thunk action creator
 * into an async deferrable action creator.
 */
export function makeDeferrable(type: ActionType) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const originalThunkAction = originalMethod.apply(this, args);
            return {
                type: type,
                asyncAction: originalThunkAction
            };
        };
        return descriptor;
    };
}
