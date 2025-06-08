import { EffectFlags, Ref } from "@vue/reactivity";

// there is no other way to get a 'dispose' event,
// so here we rely on this line https://github.com/vuejs/core/blob/e53a4ffbe0264b06971090fcaf0d8b2201478e29/packages/reactivity/src/effect.ts#L443
export default (customRef: Ref, callback: Function) => {
    // @ts-expect-error
    customRef.dep.computed = {
        get flags() {
            return EffectFlags.TRACKING;
        },
        set flags(flags) {
            if (!flags) {
                callback();
            }
        }
    };
};