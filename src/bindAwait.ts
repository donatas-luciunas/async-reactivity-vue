import { customRef, ref, computed } from '@vue/reactivity';
import { type Dependency, Watcher } from 'async-reactivity';

export const bindAwait = <T>(dependency: Dependency<Promise<T>>, initialValue: T, loadingTrack = true) => {
    // possibly unexpected behavior when loadingTrack = false
    //   it's like: is it loading? no, should it?
    //   `data` must be used to trigger load (if `data` is not used, `loading` is always false)
    //   so you can't wait until not `loading` and use `data` then, because this creates infinity loop
    //   not loading → use data → start loading → don't use data → stop loading → not loading → use data → start loading → ...

    const _isLoading = ref(false);
    const isLoading = computed(() => {
        if (loadingTrack) {
            data.value;
        }
        return _isLoading.value;
    });

    let watcher: Watcher<Promise<T>> | undefined;
    let value: T = initialValue;
    let lastPromise: Promise<T>;

    const get = (track: () => void, trigger: () => void) => {
        track();

        if (!watcher) {
            watcher = new Watcher(dependency, async newValuePromise => {
                try {
                    _isLoading.value = true;
                    lastPromise = newValuePromise;
                    const newValue = await newValuePromise;
                    if (watcher && newValuePromise === lastPromise) {
                        value = newValue;
                        trigger();
                    }
                } finally {
                    if (watcher && newValuePromise === lastPromise) {
                        _isLoading.value = false;
                    }
                }
            });

            // @ts-expect-error
            const _cleanup = data.dep.cleanup;
            // @ts-expect-error
            data.dep.cleanup = () => {
                _cleanup();
                watcher?.dispose();
                watcher = undefined;
            }
        };

        return value;
    };

    const data = customRef((track, trigger) => {
        return {
            get: () => get(track, trigger),
            set: () => {
                // ignore
            }
        };
    });

    return { data, isLoading };
};