import { DEFAULT_PROBLEM } from '../scheduling/index.js'
import { compareAlgorithms } from '../simulation/SimulationBridge.js'

/** Six short, lecturer-friendly presentation sections. No fake algorithm results. */
export const PRESENTATION_SECTIONS = Object.freeze([
    { id: 'opening', label: 'Pembukaan', zone: 'main', eyebrow: '01 / PENGANTAR', title: 'Cloud Ops: Scheduling Adventure',
        question: 'Bagaimana membagi banyak tugas ke beberapa server agar semuanya cepat selesai?',
        explanation: 'Kita punya 8 task dan 3 virtual machine (VM) dengan kecepatan berbeda. Kita akan melihat masalahnya, mencoba dua algoritma metaheuristik, lalu membandingkan hasilnya.',
        takeaway: 'Target utama: meminimalkan makespan, yaitu waktu sampai seluruh task selesai.' },
    { id: 'problem', label: 'Cloud', zone: 'cloud', eyebrow: '02 / MASALAH', title: 'Siapa mengerjakan task yang mana?',
        question: 'Apakah membagi task secara bergiliran selalu menghasilkan jadwal tercepat?',
        explanation: 'Task punya ukuran MI, sedangkan VM punya kecepatan MIPS. Task yang sama dapat membutuhkan durasi berbeda pada VM berbeda. Round Robin menjadi pembanding sederhana.',
        takeaway: 'Execution time = MI / MIPS. Makespan = beban VM yang paling lama.' },
    { id: 'aco', label: 'ACO', zone: 'aco', eyebrow: '03 / ALGORITMA', title: 'Belajar dari jejak semut',
        question: 'Bagaimana semut memilih VM dan memperbaiki keputusan berikutnya?',
        explanation: 'Setiap semut menyusun jadwal lengkap: untuk setiap task, pilih satu VM berdasarkan feromon dan perkiraan beban. Setelah jadwal dievaluasi, feromon menguap dan diperkuat pada solusi terpilih.',
        takeaway: 'Pilihan bersifat probabilistik. Jalur feromon kuat lebih menarik, tetapi bukan kepastian terpilih.' },
    { id: 'gwo', label: 'GWO', zone: 'gwo', eyebrow: '04 / ALGORITMA', title: 'Mengikuti tiga solusi terbaik',
        question: 'Bagaimana Alpha, Beta, dan Delta memandu perubahan kandidat?',
        explanation: 'Satu serigala adalah satu jadwal lengkap, bukan satu task. Tiga kandidat dengan fitness terbaik memandu pembaruan posisi kandidat lainnya, kemudian posisi didiskretisasi menjadi indeks VM.',
        takeaway: 'Gerak serigala adalah metafora kandidat solusi, bukan pencarian jarak fisik ke VM.' },
    { id: 'results', label: 'Hasil', zone: null, eyebrow: '05 / PERBANDINGAN', title: 'Jadwal mana yang lebih cepat?',
        question: 'Bagaimana hasil Round Robin, ACO, dan GWO pada data yang sama?',
        explanation: 'Perbandingan ini dihitung langsung oleh engine dengan dataset dan seed sama. Makespan adalah objektif utama; biaya dan utilization proxy hanya metrik tambahan.',
        takeaway: 'Hasil satu seed bukan bukti satu algoritma selalu lebih unggul. Anggaran evaluasinya juga berbeda.' },
    { id: 'paper', label: 'Paper', zone: null, eyebrow: '06 / REFERENSI', title: 'Dari penelitian ke simulasi edukatif',
        question: 'Apa hubungan kode yang kita jalankan dengan paper penelitian?',
        explanation: 'ACO yang dijalankan adalah baseline ACO diskret dan GWO adalah baseline standar yang didiskretisasi. Paper modern yang kami kaji menggunakan varian improved, jadi hasilnya tidak direplikasi secara identik.',
        takeaway: 'Transparan tentang asumsi, rumus, dan perbedaan implementasi dari paper.' }
])

export const PAPERS = Object.freeze([
    { algorithm: 'ACO', author: 'Hongtao Wang', year: 2024,
        title: 'Research on Task Scheduling Model of Ant Colony Optimization Cloud Computing Platform for Online Practical Customer-training Application',
        doi: 'https://doi.org/10.5573/IEIESPC.2024.13.3.243', note: 'Paper membahas OACC (improved), bukan baseline ACO kami.' },
    { algorithm: 'GWO', author: 'Hongbo Wang et al.', year: 2025,
        title: 'An improved grey wolf optimizer with flexible crossover and mutation for cluster task scheduling',
        doi: 'https://doi.org/10.1016/j.ins.2025.121943', note: 'Paper membahas GWO_C/M; kode kami tidak menerapkan crossover/mutation.' },
    { algorithm: 'GWO dasar', author: 'Mirjalili, Mirjalili & Lewis', year: 2014,
        title: 'Grey Wolf Optimizer', doi: 'https://doi.org/10.1016/j.advengsoft.2013.12.007',
        note: 'Referensi mekanisme Alpha, Beta, Delta dan pembaruan posisi GWO standar.' }
])

export const fmt = (number, decimals = 2) => Number(number).toLocaleString('id-ID', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals
})

export function buildComparison({ problem = DEFAULT_PROBLEM, seed = 42, iterations = 50, ants = 12, wolves = 12 } = {})
{
    const comparison = compareAlgorithms(problem, { seed, iterations, ants, wolves })
    const rows = [
        { id: 'round-robin', name: 'Round Robin', ...comparison.baseline },
        { id: 'aco', name: 'ACO', ...comparison.aco },
        { id: 'gwo', name: 'GWO', ...comparison.gwo }
    ].map(({ id, name, metrics, bestAssignment, fitnessEvaluations }) => ({
        id, name, metrics, assignment: [...bestAssignment], fitnessEvaluations,
        bestSoFar: id === 'round-robin' ? null : [...comparison[id].history.map(h => h.bestSoFar)]
    }))
    return { ...comparison, rows, dataset: { tasks: problem.tasks.map(t => ({ ...t })), vms: problem.vms.map(v => ({ ...v })) } }
}

/** Numerically correct SVG polyline coordinates from actual engine history. */
export function convergencePolyline(values, { width = 360, height = 126, min, max } = {})
{
    if(!Array.isArray(values) || !values.length || values.some(v => !Number.isFinite(v)))
        throw new RangeError('Convergence requires finite nonempty values')
    if(!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
        throw new RangeError('Invalid chart dimensions')
    const lo = min ?? Math.min(...values)
    const hi = max ?? Math.max(...values)
    if(!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo)
        throw new RangeError('Invalid convergence range')
    const range = hi - lo || 1
    return values.map((v, i) => ({
        x: values.length === 1 ? 0 : (i / (values.length - 1)) * width,
        y: height - ((v - lo) / range) * height
    }))
}

export function lessonDetail(step, problem = DEFAULT_PROBLEM)
{
    if(!step) return { headline: 'Pilih Step untuk melihat satu keputusan.', lines: [] }
    const e = step.source
    if(step.kind === 'allocation')
        return { headline: `${e.taskId} → ${e.vmId}`,
            lines: [`Durasi task di VM ini: ${fmt(e.executionTime)} detik`,
                `Load VM1/VM2/VM3: ${e.vmLoads.map(x => fmt(x)).join(' / ')} detik`,
                'Round Robin bergiliran memilih VM; bukan mencari jadwal optimal.'] }
    if(step.kind === 'ant-choice')
        return { headline: `${e.taskId} → ${e.vmId} (semut ${e.ant})`,
            lines: [
                `Probabilitas VM1/VM2/VM3: ${e.probabilities.map(p => fmt(p * 100, 1) + '%').join(' / ')}`,
                `Feromon untuk task ini: ${e.pheromone.map(x => fmt(x, 3)).join(' / ')}`,
                'Probabilitas dihitung dari feromon dan heuristik. Pemilihan menggunakan roulette seeded.'
            ] }
    if(step.kind === 'pheromone-update')
        return { headline: `Iterasi ${e.iteration}: evaporasi + deposit`,
            lines: [`Hasil terbaik iterasi: ${fmt(e.iterationBest)} detik`,
                `Terbaik sejauh ini: ${fmt(e.bestSoFar)} detik`,
                'Seluruh semut dievaluasi; hanya semut contoh yang diperlihatkan langkah per langkah.'] }
    if(step.kind === 'wolf-iteration')
    {
        // Match the two-decimal labels on the 3D wolves and candidate board.
        const seconds = value => value.toFixed(2).replace('.', ',')
        const leaders = [['Alpha', e.leaders.alpha], ['Beta', e.leaders.beta], ['Delta', e.leaders.delta]]
        const lines = leaders.flatMap(([role, candidate]) => [
            `${role} (${candidate.id}) · Fitness saat ini: ${seconds(candidate.fitness)} detik`,
            candidate.assignment.map((vm, task) => `${problem.tasks[task].id} → ${problem.vms[vm].id}`).join(' · '),
            `Beban: ${candidate.vmLoads.map((load, vm) => `${problem.vms[vm].id} ${seconds(load)} s`).join(' · ')}`
        ])
        const fitness = leaders.map(([, candidate]) => candidate.fitness)
        if(new Set(fitness).size < fitness.length)
            lines.push('Fitness yang sama berarti beban VM terlama sama. Pembagian task dan beban VM lain bisa berbeda.')
        if(leaders.every(([, candidate]) => candidate.assignment.every((vm, task) => vm === e.leaders.alpha.assignment[task])))
            lines.push('Ketiga pemimpin memiliki ID berbeda, tetapi menggunakan jadwal yang sama pada iterasi ini.')
        if(new Set(fitness.map(seconds)).size < new Set(fitness).size)
            lines.push('Sebagian fitness tampak sama karena dibulatkan ke dua desimal.')
        lines.push(
            `Rekor sejauh ini: ${seconds(e.bestSoFar)} detik. Rekor menyimpan jadwal tercepat yang pernah ditemukan, termasuk sebelum iterasi pertama. Pemimpin di atas berasal dari populasi iterasi ini.`,
            'Tiga pemimpin sebelum pembaruan memandu iterasi ini. Peringkat di atas dihitung setelah pembaruan.'
        )
        return { headline: `Iterasi ${e.iteration}: kandidat diperbarui`, lines }
    }
    return { headline: step.title, lines: [step.explanation] }
}
