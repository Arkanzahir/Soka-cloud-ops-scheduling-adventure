import { DEFAULT_PROBLEM } from '../scheduling/problem.js'
import { HYBRID_MODES, runHybrid } from '../scheduling/hybrid.js'

const fmt = value => value.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

function explain(event, problem)
{
    const { heuristic } = HYBRID_MODES[event.mode]
    const makespan = event.metrics?.makespan
    switch(event.type)
    {
        case 'allocation': {
            const task = problem.tasks[event.taskIndex].id, vm = problem.vms[event.vmIndex].id
            const criterion = event.mode === 'aco' ? 'terbesar' : 'terkecil'
            return [`${heuristic} · ${task} → ${vm}`,
                `Dari waktu selesai tercepat tiap task, ${task} punya nilai ${criterion} (${fmt(event.minima[event.taskIndex])} detik). Antrean VM tujuan bertambah.`]
        }
        case 'pheromone-seed':
            return ['Jadwal Max-Min → feromon awal',
                `Makespan awal ${fmt(makespan)} detik. Pasangan task dan VM dari Max-Min mulai dengan feromon 3, jalur lainnya 1. Diorama menampilkan jalur T1.`]
        case 'ant':
            return [`Semut 1 · T1 → ${problem.vms[event.assignment[0]].id}`,
                `Semut membangun satu jadwal lengkap dari probabilitas feromon dan waktu eksekusi. Kandidat contoh selesai dalam ${fmt(makespan)} detik.`]
        case 'pheromone-update':
            return [`ACO · iterasi ${event.iteration}/50`,
                `Setelah 25 semut dievaluasi, feromon menguap dan jalur jadwal terbaik diperkuat. Rekor sejauh ini ${fmt(makespan)} detik.`]
        case 'chromosome-seed':
            return ['Jadwal Min-Min → kromosom pertama',
                `Makespan awal ${fmt(makespan)} detik. Pada meja GA, setiap posisi berarti satu task dan setiap warna menunjukkan VM tujuannya.`]
        case 'selection':
            return ['GA · pilih dua induk',
                'Untuk tiap induk, GA mengambil tiga kandidat secara acak dan memilih jadwal dengan makespan terkecil.']
        case 'crossover':
            return ['GA · gabungkan gen',
                event.point === null ? 'Pasangan ini melewati crossover, sehingga kromosom anak menyalin induk A.'
                    : `Anak mengambil ${event.point} gen pertama dari induk A. Mulai T${event.point + 1}, gen diambil dari induk B.`]
        case 'mutation':
            return ['GA · mutasi gen',
                event.mutations.length ? `Mutasi mengubah VM untuk ${event.mutations.map(i => problem.tasks[i].id).join(', ')}.`
                    : 'VM tujuan pada kandidat contoh ini tetap sama setelah fase mutasi.']
        case 'generation':
            return [`GA · generasi ${event.iteration}/50`,
                `Elitisme membawa jadwal terbaik ke generasi berikutnya. Rekor sejauh ini ${fmt(makespan)} detik.`]
        case 'hybrid-result':
            return ['Jadwal terbaik',
                `${heuristic} memberi makespan awal ${fmt(event.initialMakespan)} detik. Hasil setelah optimasi ${fmt(makespan)} detik.`]
    }
}

export function createHybridLesson(mode, { problem = DEFAULT_PROBLEM, seed = 42 } = {})
{
    const run = runHybrid(problem, { mode, seed })
    const timeline = run.events.map(source => {
        const [title, explanation] = explain(source, problem)
        return { algorithm: 'hybrid', kind: source.type, source, title, explanation }
    })
    return { algorithm: 'hybrid', problem, run, timeline }
}

export function allocationTable(problem, event)
{
    const cell = (tag, text, scope) => {
        const element = document.createElement(tag)
        element.textContent = text
        if(scope) element.scope = scope
        return element
    }
    const table = document.createElement('table')
    table.className = 'co-hybrid-matrix'
    const caption = table.createCaption()
    caption.textContent = 'Perkiraan selesai sebelum alokasi (detik) · tebal = tercepat per task'
    const header = table.createTHead().insertRow()
    header.append(cell('th','Task','col'), ...problem.vms.map(vm => cell('th',vm.id,'col')))
    const body = table.createTBody()
    event.completion.forEach((times, task) => {
        if(!times) return
        const row = body.insertRow()
        row.append(cell('th',problem.tasks[task].id,'row'))
        times.forEach((time, vm) => {
            const value = cell('td',fmt(time))
            if(time === event.minima[task]) value.dataset.minimum = ''
            if(task === event.taskIndex && vm === event.vmIndex)
            {
                value.dataset.selected = ''
                value.setAttribute('aria-label',`${fmt(time)} detik, pilihan ${HYBRID_MODES[event.mode].heuristic}`)
            }
            row.append(value)
        })
    })
    return table
}

export function hybridDetail(step, problem)
{
    if(!step) return { headline: 'Task menunggu di antrean', lines: [] }
    const { source: event } = step
    const lines = []
    if(event.pheromone)
        lines.push(`Feromon T1 · ${event.pheromone[0].map((value,vm) => `${problem.vms[vm].id} = ${fmt(value)}`).join(' · ')}`)
    if(event.metrics)
        lines.push(event.metrics.vmLoads.map((value,vm) => `${problem.vms[vm].id} = ${fmt(value)} dtk`).join(' · '))
    return { headline: step.title, lines }
}
