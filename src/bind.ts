import { customRef } from '@vue/reactivity';
import { type Dependency, Watcher } from 'async-reactivity';
import onStopTracking from "./onStopTracking.js";

export const bind = <T>(dependency: Dependency<T>) => {
    let watcher: Watcher<T> | undefined;

    const get = (track: () => void, trigger: () => void) => {
        track();

        if (!watcher) {
            watcher = new Watcher(dependency, () => trigger());
        }

        onStopTracking(data, () => {
            watcher?.dispose();
            watcher = undefined;
            trigger();
        });

        return dependency.value;
    };

    const data = customRef((track, trigger) => {
        return {
            get: () => get(track, trigger),
            set: () => {
                // ignore
            }
        };
    });

    return data;
};