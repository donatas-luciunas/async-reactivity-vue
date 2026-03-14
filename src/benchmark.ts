import { shallowRef, computed } from '@vue/reactivity';
import { Ref, Computed } from 'async-reactivity';

const memoryItems = 10000;
const checkMemory = (func: Function) => {
    global.gc?.();
    const memoryBefore = process.memoryUsage().heapUsed;

    const result = func();
    global.gc?.();
    result;

    const memoryAfter = process.memoryUsage().heapUsed;

    console.log('Memory used:', ((memoryAfter - memoryBefore) / memoryItems).toFixed(0), 'bytes');
};

const speedRuns = 10000;

const checkSpeed = (func: Function) => {
    const timeBefore = process.hrtime.bigint();

    for (let i = 0; i < speedRuns; i++) {
        func();
    }

    const timeAfter = process.hrtime.bigint();
    console.log('Time taken:', ((timeAfter - timeBefore) / BigInt(speedRuns)).toString(), 'nanoseconds');
};

console.log('--- Memory Usage ---');
{
    console.log('@vue/reactivity | shallowRef');
    checkMemory(() => Array.from({ length: memoryItems }, () => shallowRef(1)));

    console.log('async-reactivity | Ref');
    checkMemory(() => Array.from({ length: memoryItems }, () => new Ref(1)));

    console.log();

    console.log('@vue/reactivity | computed');
    checkMemory(() => Array.from({ length: memoryItems }, () => computed(() => 1)));

    console.log('async-reactivity | Computed');
    checkMemory(() => Array.from({ length: memoryItems }, () => new Computed(() => 1)));
}

console.log('\n\n--- Speed ---');
{
    console.log('@vue/reactivity | shallowRef + computed');
    checkSpeed(() => {
        const a = shallowRef(1);
        const b = computed(() => a.value + 1);
        b.value;
    });

    console.log('async-reactivity | Ref + Computed');
    checkSpeed(() => {
        const a = new Ref(1);
        const b = new Computed(value => value(a) + 1);
        b.value;
    });

    console.log();

    {
        console.log('@vue/reactivity | recompute');
        const a = shallowRef(1);
        const b = computed(() => a.value + 1);
        checkSpeed(() => {
            a.value++;
            b.value;
        });
    }

    {
        console.log('async-reactivity | recompute');
        const a = new Ref(1);
        const b = new Computed(value => value(a) + 1);
        checkSpeed(() => {
            a.value++;
            b.value;
        });
    }

    console.log();

    {
        console.log('@vue/reactivity | recompute same');
        const a = shallowRef(1);
        const b = computed(() => a.value % 2);
        const c = computed(() => b.value + 1);
        checkSpeed(() => {
            a.value += 2;
            c.value;
        });
    }

    {
        console.log('async-reactivity | recompute same');
        const a = new Ref(1);
        const b = new Computed(value => value(a) % 2);
        const c = new Computed(value => value(b) + 1);
        checkSpeed(() => {
            a.value += 2;
            c.value;
        });
    }
}