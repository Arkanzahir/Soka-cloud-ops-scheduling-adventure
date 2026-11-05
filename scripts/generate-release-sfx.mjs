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
const sounds = {
    click: [0.09, t => attack(t) * Math.exp(-55 * t) * (0.15 * sine(t * 720) + 0.08 * noise())],
    impact: [0.24, t => attack(t) * Math.exp(-19 * t) * (0.25 * sine(t * 85) + 0.14 * noise())],
    horn: [0.42, t => Math.min(t * 35, 1, (0.42 - t) * 20) * (0.17 * sine(t * 330) + 0.12 * sine(t * 415))],
    engine: [1, t => (0.7 + 0.3 * sine(12 * t)) * (0.15 * sine(45 * t) + 0.08 * sine(90 * t) + 0.035 * sine(135 * t))],
    ambience: [2, t => (0.6 + 0.4 * sine(t)) * (0.06 * noise() + 0.017 * sine(32 * t))],
    waves: [4, surf],
    chirp: [0.32, t => attack(t) * (1 - t / 0.32) ** 2 * 0.18 * sine(560 * t + 860 * t * t)],
    chime: [0.65, t => attack(t) * Math.exp(-6 * t) * (0.16 * sine(t * 523) + 0.1 * sine(t * 784))]
}

for(const [name, [duration, sample]] of Object.entries(sounds)) {
    const frames = Math.ceil(rate * duration)
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
        wav.writeInt16LE(Math.round(32767 * sample(frame / rate)), 44 + 2 * frame)
    writeFileSync(new URL(name + '.wav', directory), wav)
}
