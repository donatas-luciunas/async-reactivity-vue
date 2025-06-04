import assert from 'assert';
import { Computed, Ref } from 'async-reactivity';
import { bindAwait } from './bindAwait.js';
import { computed, watch } from '@vue/reactivity';

describe('bindAwait', function () {
    it('initial', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0);

        assert.strictEqual(b.data.value, 0);
        assert.strictEqual(b.isLoading.value, true);
    });

    it('initial', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0);

        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(b.data.value, 0);
        assert.strictEqual(b.isLoading.value, true);
    });

    it('default', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0);

        b.data.value;
        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(b.data.value, 1);
        assert.strictEqual(b.isLoading.value, false);
    });

    it('isLoading track', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0);

        b.isLoading.value;
        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(b.data.value, 1);
        assert.strictEqual(b.isLoading.value, false);
    });

    it('isLoading track disable', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0, false);

        b.isLoading.value;
        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(b.data.value, 0);
        assert.strictEqual(b.isLoading.value, true);
    });

    it('multiple', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0).data;
        const c = bindAwait(a, 0).data;

        b.value;
        c.value;
        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(b.value, 1);
        assert.strictEqual(c.value, 1);
    });

    it('update', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0);

        b.data.value;
        a.value = Promise.resolve(2);
        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(b.data.value, 2);
        assert.strictEqual(b.isLoading.value, false);
    });

    describe('computed', function () {
        it('', async function () {
            const a = new Ref(Promise.resolve(1));
            const b = bindAwait(a, 0).data;
            const c = computed(() => b.value);

            assert.strictEqual(c.value, 0);
            await new Promise(resolve => setTimeout(resolve));

            assert.strictEqual(c.value, 1);
        });

        it('update', async function () {
            const a = new Ref(Promise.resolve(1));
            const b = bindAwait(a, 0).data;
            const c = computed(() => b.value);

            assert.strictEqual(c.value, 0);
            a.value = Promise.resolve(2);
            await new Promise(resolve => setTimeout(resolve));

            assert.strictEqual(c.value, 2);
        });
    });

    it('no subscribers', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = new Computed(async value => await value(a) + 1);
        const c = bindAwait(b, 0);
        
        const w = watch(c.data, () => {});

        await new Promise(resolve => setTimeout(resolve));
        // @ts-expect-error
        assert.strictEqual(b.state, 1);
        assert.strictEqual(c.data.value, 2);
        w.stop();
        a.value = Promise.resolve(2);

        // @ts-expect-error
        assert.strictEqual(b.state, 2);
    });

    it('concurrent update longer', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0);

        b.data.value;
        a.value = new Promise(resolve => setTimeout(() => resolve(2), 100));
        await new Promise(resolve => setTimeout(resolve, 50));
        assert.strictEqual(b.isLoading.value, true);
        a.value = new Promise(resolve => setTimeout(() => resolve(3), 100));
        await new Promise(resolve => setTimeout(resolve, 60));

        assert.strictEqual(b.data.value, 1);
        assert.strictEqual(b.isLoading.value, true);
    });

    it('concurrent update shorter', async function () {
        const a = new Ref(Promise.resolve(1));
        const b = bindAwait(a, 0);

        b.data.value;
        a.value = new Promise(resolve => setTimeout(() => resolve(2), 100));
        await new Promise(resolve => setTimeout(resolve, 50));
        a.value = Promise.resolve(3);
        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(b.data.value, 3);
        assert.strictEqual(b.isLoading.value, false);
    });

    describe('stop watching', function () {
        it('', async function () {
            let gate = 0;
            const a = new Ref(1);
            const b = bindAwait(new Computed(async (value) => {
                gate++;
                await new Promise(resolve => setTimeout(resolve));
                return value(a);
            }), 0);
            const w = watch(b.data, () => {});

            await new Promise(resolve => setTimeout(resolve));
            assert.strictEqual(b.data.value, 1);
            assert.strictEqual(gate, 1);

            w.stop();

            a.value = 2;

            await new Promise(resolve => setTimeout(resolve, 10));
            assert.strictEqual(gate, 1);
        });

        it('computed', async function () {
            let gate = 0;
            const a = new Ref(1);
            const b = bindAwait(new Computed(async (value) => {
                gate++;
                await new Promise(resolve => setTimeout(resolve));
                return value(a);
            }), 0);
            const c = computed(() => b.data.value);
            const w = watch(c, () => {});

            await new Promise(resolve => setTimeout(resolve));
            assert.strictEqual(c.value, 1);
            assert.strictEqual(gate, 1);

            w.stop();

            a.value = 2;

            await new Promise(resolve => setTimeout(resolve, 10));
            assert.strictEqual(gate, 1);
        });
    });
});