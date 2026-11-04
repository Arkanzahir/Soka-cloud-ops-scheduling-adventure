/** Mulberry32 PRNG: repeatable for a given unsigned 32-bit seed, no Math.random(). */
export function createRng(seed = 42)
{
    if(!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
        throw new RangeError('Seed must be an unsigned 32-bit integer')
    let state = seed >>> 0
    return () =>
    {
        state = (state + 0x6d2b79f5) >>> 0
        let x = state
        x = Math.imul(x ^ (x >>> 15), x | 1)
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296
    }
}

export function roulette(probabilities, rng)
{
    const r = rng()
    let sum = 0
    for(let i = 0; i < probabilities.length; i++)
    {
        sum += probabilities[i]
        if(r < sum || i === probabilities.length - 1) return i
    }
    throw new Error('No choices')
}

export function normalizeWeights(weights)
{
    if(!weights.length || weights.some(w => !Number.isFinite(w) || w < 0))
        throw new RangeError('Weights must be nonnegative finite values')
    const max = Math.max(...weights)
    if(max === 0) return weights.map(() => 1 / weights.length)
    const scaled = weights.map(w => w / max)
    const total = scaled.reduce((a, b) => a + b, 0)
    return scaled.map(w => w / total)
}
