import { mkdirSync, writeFileSync } from 'node:fs'

const directory = new URL('../static/sounds/cloud-ops/', import.meta.url)
mkdirSync(directory, { recursive: true })
const rate = 22050
const sine = cycles => Math.sin(2 * Math.PI * cycles)
let seed = 187
const noise = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 2147483648 - 1
}
const attack = t => Math.min(t * 400, 1)
// Fixed whole-cycle harmonics make a seamless, low-pass shore loop.
const surf = t => (
    0.022 * sine(43 * t) + 0.019 * sine(59 * t + 0.2) +
    0.016 * sine(79 * t + 0.6) + 0.012 * sine(127 * t + 0.3) +
    0.008 * sine(191 * t + 0.4) + 0.006 * sine(283 * t)
) * (0.66 + 0.34 * sine(t / 4))
// Upper harmonics keep the engine audible on speakers that roll off the bass.
const motor = t => (0.87 + 0.13 * sine(16 * t)) * (
    0.115 * sine(64 * t) + 0.09 * sine(128 * t + .2) +
    0.07 * sine(192 * t + .55) + 0.045 * sine(256 * t + .7) +
    0.025 * sine(320 * t + .3) + 0.017 * sine(384 * t)
)
const sounds = {
    click: [0.09, t => attack(t) * Math.exp(-55 * t) * (0.15 * sine(t * 720) + 0.08 * noise())],
    impact: [0.24, t => attack(t) * Math.exp(-19 * t) * (0.25 * sine(t * 85) + 0.14 * noise())],
    horn: [0.42, t => Math.min(t * 35, 1, (0.42 - t) * 20) * (0.17 * sine(t * 330) + 0.12 * sine(t * 415))],
    engine: [1, motor],
    ambience: [2, t => (0.6 + 0.4 * sine(t)) * (0.06 * noise() + 0.017 * sine(32 * t))],
    waves: [4, surf],
    chirp: [0.32, t => attack(t) * (1 - t / 0.32) ** 2 * 0.18 * sine(560 * t + 860 * t * t)],
    chime: [0.65, t => attack(t) * Math.exp(-6 * t) * (0.16 * sine(t * 523) + 0.1 * sine(t * 784))]
}

function softenLoop(samples) {
    let filtered = 0
    // Warm the filter from the end of the loop so playback wraps smoothly.
    for(let frame = -256; frame < samples.length; frame++) {
        const index = frame < 0 ? samples.length + frame : frame
        filtered += (samples[index] - filtered) * 0.12
        if(frame >= 0) samples[frame] = filtered
    }
}

for(const [name, [duration, sample]] of Object.entries(sounds)) {
    const frames = Math.ceil(rate * duration)
    const samples = Float64Array.from({ length: frames }, (_, frame) => sample(frame / rate))
    if(name === 'ambience') softenLoop(samples)
    const wav = Buffer.alloc(44 + 2 * frames)
    wav.write('RIFF')
    wav.writeUInt32LE(wav.length - 8, 4)
    wav.write('WAVEfmt ', 8)
    wav.writeUInt32LE(16, 16)
    wav.writeUInt16LE(1, 20)
    wav.writeUInt16LE(1, 22)
    wav.writeUInt32LE(rate, 24)
    wav.writeUInt32LE(2 * rate, 28)
    wav.writeUInt16LE(2, 32)
    wav.writeUInt16LE(16, 34)
    wav.write('data', 36)
    wav.writeUInt32LE(2 * frames, 40)
    for(let frame = 0; frame < frames; frame++)
        wav.writeInt16LE(Math.round(32767 * samples[frame]), 44 + 2 * frame)
    writeFileSync(new URL(name + '.wav', directory), wav)
}
