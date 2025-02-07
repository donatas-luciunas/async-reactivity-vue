import { customRef } from '@vue/reactivity';
import { type Dependency, Watcher } from 'async-reactivity';

export const bind = <T>(dependency: Dependency<T>) => {
    let watcher: Watcher<T> | undefined;

    const get = (track: () => void, trigger: () => void) => {
        track();

        if (!watcher) {
            watcher = new Watcher(dependency, () => trigger());

            // @ts-expect-error
            data.dep.map = {
                delete() {
                    watcher?.dispose();
                    watcher = undefined;
                }
            };
        };

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