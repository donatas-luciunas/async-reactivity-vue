import { customRef, EffectFlags } from '@vue/reactivity';
import { type Dependency, Watcher } from 'async-reactivity';

export const bind = <T>(dependency: Dependency<T>) => {
    let watcher: Watcher<T> | undefined;

    const get = (track: () => void, trigger: () => void) => {
        track();

        if (!watcher) {
            watcher = new Watcher(dependency, () => trigger());

            // there is no other way to get a 'dispose' event,
            // so here we rely on this line https://github.com/vuejs/core/blob/e53a4ffbe0264b06971090fcaf0d8b2201478e29/packages/reactivity/src/effect.ts#L443
            // @ts-expect-error
            data.dep.computed = {
                get flags() {
                    return EffectFlags.TRACKING;
                },
                set flags(flags) {
                    if (!flags) {
                        watcher?.dispose();
                        watcher = undefined;
                    }
                }
            };
        }

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