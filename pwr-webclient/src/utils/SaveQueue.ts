/**
 * A change that saves right away, without a form (#320)
 */
interface QueuedChange {
    /** Changes with the same key replace each other while they wait; null for one that never may be dropped */
    key: string | null;
    /** Sends the change and puts the answer into the state; builds its request only now, from the state of now */
    send: () => Promise<unknown>;
    /** Called once the change, or the one that replaced it, is answered, successfully or not */
    onSettled: Array<() => void>;
}

/** Per queue the change being sent first, then those waiting */
const queues = new Map<string, Array<QueuedChange>>();

function sendNext(queue: string) {
    const changes = queues.get(queue);
    const change = changes[0];
    // Also a send that throws right away ends in the catch, so the queue never gets stuck
    Promise.resolve()
        .then(change.send)
        // The client has shown the error, the state stays as it was
        .catch(error => console.error(error))
        .then(() => {
            change.onSettled.forEach(onSettled => onSettled());
            changes.shift();
            if (changes.length > 0) {
                sendNext(queue);
            } else {
                queues.delete(queue);
            }
        });
}

/**
 * Changes of the same queue go to the server one after the other (#320): the next request starts once the previous one
 * is answered, so the answers come in the order of the changes, and the state and the server end at the last change of
 * the user, however late the server answers. Of several changes with the same key in a row that wait, only the last
 * one is sent. Different queues run in parallel.
 *
 * A queue is what the server saves as a whole: a profile skill, or a whole view profile, which the view-profile
 * service reads and writes back as a whole for every change.
 */
export function saveInOrder(queue: string, key: string | null, send: () => Promise<unknown>, onSettled?: () => void): void {
    const change: QueuedChange = {key, send, onSettled: onSettled ? [onSettled] : []};
    const changes = queues.get(queue);
    if (!changes) {
        queues.set(queue, [change]);
        sendNext(queue);
        return;
    }
    const last = changes[changes.length - 1];
    // Only one that waits, never the one being sent, and only the last: a change in between may depend on it
    if (changes.length > 1 && key !== null && last.key === key) {
        change.onSettled = [...last.onSettled, ...change.onSettled];
        changes[changes.length - 1] = change;
    } else {
        changes.push(change);
    }
}
