import assert from 'assert';
import { Computed, Ref } from 'async-reactivity';
import { bind } from './bind.js';
import { computed, watch } from '@vue/reactivity';

describe('bind', function () {
    it('', function () {
        const a = new Ref(1);
        const b = bind(a);

        assert.strictEqual(b.value, 1);
    });

    it('multiple', function () {
        const a = new Ref(1);
        const b = bind(a);
        const c = bind(a);

        assert.strictEqual(b.value, 1);
        assert.strictEqual(c.value, 1);
    });

    it('update', function () {
        const a = new Ref(1);
        const b = bind(a);

        a.value = 2;

        assert.strictEqual(b.value, 2);
    });

    describe('computed', function () {
        it('', function () {
            const a = new Ref(1);
            const b = bind(a);
            const c = computed(() => b.value);

            assert.strictEqual(c.value, 1);
        });

        it('update', async function () {
            const a = new Ref(1);
            const b = bind(a);
            const c = computed(() => b.value);

            a.value = 2;

            assert.strictEqual(c.value, 2);
        });
    });
    
    it('no subscribers', function () {
        const a = new Ref(1);
        const b = new Computed(value => value(a) + 1);
        const c = bind(b);
        
        const w = watch(c, () => {});

        // @ts-expect-error
        assert.strictEqual(b.state, 1);
        assert.strictEqual(c.value, 2);
        w.stop();
        a.value = 2;

        // @ts-expect-error
        assert.strictEqual(b.state, 2);
    });
});