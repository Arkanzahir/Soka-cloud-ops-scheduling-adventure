import { createLesson, createWorldAdapter, LessonPlayer } from '../simulation/SimulationBridge.js'
import { buildComparison, convergencePolyline, fmt, lessonDetail, PAPERS, PRESENTATION_SECTIONS } from './PresentationContent.js'
import { runACO, runRoundRobin } from '../scheduling/index.js'
import { EXPERIMENT_DEFAULTS, createExperimentProblem, validateExperimentConfig } from './ExperimentConfig.js'

const CHART_NS = 'http://www.w3.org/2000/svg'
const $ = (root, selector) => root.querySelector(selector)

/** M6 stage-1 accessible learning overlay. Caller controls vehicle locking/modal integration. */
export class LearningPanel
{
    constructor({ mount = document.body, worlds = {}, navigate = null, onOpen = () => {},
        onClose = () => {}, embedded = false, escapeCloses = !embedded, seed = 42 } = {})
    {
        if(!mount || typeof mount.appendChild !== 'function') throw new TypeError('DOM mount is required')
        if(!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('Invalid seed')
        this.mount = mount
        this.worlds = worlds
        this.navigate = navigate
        this.onOpen = onOpen
        this.onClose = onClose
        this.escapeCloses = escapeCloses
        this.seed = seed
        this.iterations = 50
        this.demoIterations = 4
        this.acoDisplayMode='colony'
        this.experimentExpanded=false
        this.experiment={...EXPERIMENT_DEFAULTS,seed:this.seed}
        this.experimentProblem=createExperimentProblem(this.experiment)
        this.experimentRuns=this.computeExperiment()
        this.slide = 0
        this.visible = false
        this.player = null
        this.lesson = null
        this.delay = 950
        this.comparison = buildComparison({ seed: this.seed, iterations: this.iterations })
        this.root = document.createElement('section')
        this.root.className = `co-learning${embedded ? ' co-learning--embedded' : ''}`
        this.root.setAttribute('role', 'region')
        this.root.setAttribute('aria-label', 'Cloud Ops: materi dan simulasi')
        this.root.hidden = true
        this.root.innerHTML = `
            <div class="co-header">
                <div><div class="co-brand">✦ CLOUD OPS <span>LEARNING STATION</span></div>
                  <div class="co-heading">Scheduling Adventure</div></div>
                <button type="button" data-action="close" class="co-button co-close" aria-label="Tutup materi">✕</button>
            </div>
            <nav class="co-nav" aria-label="Urutan presentasi"></nav>
            <div class="co-content">
              <div class="co-eyebrow"></div>
              <h2 class="co-title"></h2>
              <p class="co-question"></p>
              <p class="co-explanation"></p>
              <div class="co-takeaway"><span>INTI PEMBELAJARAN</span><p></p></div>
              <p class="co-config-scope" hidden>Mode eksperimen hanya berlaku untuk Cloud dan ACO. Demonstrasi GWO serta tab Hasil tetap memakai skenario standar 8 task / 3 VM / 50 iterasi agar perbandingan referensi konsisten.</p>
              <div class="co-experiment" hidden>
                <div class="co-panel-heading">EKSPERIMEN PARAMETER ACO <button type="button" class="co-button co-experiment-toggle" data-action="experiment-toggle" aria-expanded="false">⚙ Atur</button></div>
                <div class="co-experiment-current"></div>
                <div class="co-experiment-body" hidden>
                <p class="co-demo-label">Ubah jumlah task, jumlah VM, atau iterasi. Dunia Cloud/ACO dan engine menggunakan konfigurasi yang sama.</p>
                <div class="co-experiment-fields">
                  <label>Task <select data-experiment="taskCount" aria-label="Jumlah task"><option value="4">4</option><option value="6">6</option><option value="8">8</option></select></label>
                  <label>VM <select data-experiment="vmCount" aria-label="Jumlah VM"><option value="2">2</option><option value="3">3</option></select></label>
                  <label>Iterasi <select data-experiment="iterations" aria-label="Jumlah iterasi ACO"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></label>
                </div>
                <div class="co-controls">
                  <button type="button" class="co-button co-button-primary" data-action="experiment-apply">▶ Terapkan &amp; Hitung</button>
                  <button type="button" class="co-button" data-action="experiment-default">↺ Default</button>
                </div>
                <div class="co-experiment-result" aria-live="polite"></div>
                <p class="co-demo-label">Demo 3D memutar maksimal 4 iterasi awal; angka hasil ACO dihitung dari seluruh iterasi yang dipilih. Tab Hasil tetap perbandingan standar.</p>
                </div>
              </div>
              <div class="co-simulation" hidden>
                <div class="co-panel-heading">SIMULASI LANGKAH NYATA <span class="co-step-count"></span></div>
                <div class="co-demo-label">Demo pendek dengan hasil engine M4, bukan animasi acak.</div>
                <div class="co-step-title" aria-live="polite"></div>
                <p class="co-step-summary"></p>
                <div class="co-step-details"></div>
                <div class="co-controls">
                  <button type="button" class="co-button co-button-primary" data-action="step">Langkah →</button>
                  <button type="button" class="co-button" data-action="play">▶ Play</button>
                  <button type="button" class="co-button" data-action="pause">Ⅱ Pause</button>
                  <button type="button" class="co-button" data-action="reset">↺ Reset</button>
                  <button type="button" class="co-button" data-action="aco-display-mode" hidden>🐜 Mode Koloni: 12 semut</button>
                </div>
                <div class="co-demo-footnote">World 3D: <strong class="co-world-connection"></strong>. Tekan Step untuk mengamati keputusan berikutnya.</div>
              </div>
              <div class="co-comparison" hidden>
                <div class="co-panel-heading">HASIL PERHITUNGAN ENGINE <span>MI / MIPS · MAKESPAN</span></div>
                <div class="co-metrics"></div>
                <div class="co-plot-wrap"><div class="co-plot-title">Best-so-far makespan per iterasi</div><div class="co-plot"></div></div>
                <div class="co-result-disclosure"><div class="co-panel-heading">ALOKASI TASK → VM</div><div class="co-assignments"></div></div>
                <p class="co-disclaimer">Seed 42 secara default · 50 iterasi · ACO 12 semut, GWO 12 serigala. Jumlah evaluasi berbeda. Biaya simulasi bukan tarif cloud nyata dan utilization hanya proxy waktu sibuk.</p>
              </div>
              <div class="co-papers" hidden>
                <div class="co-panel-heading">REFERENSI ILMIAH</div><div class="co-paper-list"></div>
                <p class="co-disclaimer">Kode menggunakan baseline ACO dan GWO standar yang didiskretisasi, bukan reproduksi identik OACC atau GWO_C/M. Perbandingan hasil adalah simulasi sendiri.</p>
              </div>
              <div class="co-feedback" aria-live="polite"></div>
            </div>
            <footer class="co-footer">
              <button type="button" class="co-button" data-action="previous">← Sebelumnya</button>
              <span class="co-slide-count"></span>
              <button type="button" class="co-button co-button-primary" data-action="next">Berikutnya →</button>
            </footer>`
        this.mount.appendChild(this.root)
        this.clickHandler = event => this.handleClick(event)
        this.root.addEventListener('click', this.clickHandler)
        this.escapeHandler = event =>
        {
            if(this.visible && this.escapeCloses && event.key === 'Escape')
            {
                event.preventDefault()
                event.stopImmediatePropagation()
                this.close()
            }
        }
        this.makeNav()
        this.updateExperimentDisclosure()
        this.render()
    }

    makeNav()
    {
        const node = $(this.root, '.co-nav')
        PRESENTATION_SECTIONS.forEach((section, index) =>
        {
            const button = document.createElement('button')
            button.type = 'button'
            button.className = 'co-nav-item'
            button.dataset.action = 'slide'
            button.dataset.index = String(index)
            button.textContent = section.label
            button.setAttribute('aria-label', `${index + 1}. ${section.label}`)
            node.appendChild(button)
        })
    }

    open(index = this.slide)
    {
        if(this.visible) { this.goTo(index); return }
        this.onOpen()
        this.visible = true
        this.root.hidden = false
        if(this.escapeCloses) document.addEventListener('keydown', this.escapeHandler, true)
        this.goTo(index)
        this.root.tabIndex = -1
        this.root.focus()
    }

    close()
    {
        if(!this.visible) return
        this.player?.pause()
        if(this.lesson?.algorithm==='aco')this.worlds.aco?.setPaused?.(true)
        this.visible = false
        this.root.hidden = true
        document.removeEventListener('keydown', this.escapeHandler, true)
        this.onClose()
    }

    dispose()
    {
        this.close()
        this.player?.dispose()
        this.root.removeEventListener('click', this.clickHandler)
        this.root.remove()
    }

    async goTo(index)
    {
        if(!Number.isInteger(index) || index < 0 || index >= PRESENTATION_SECTIONS.length)
            throw new RangeError('Invalid slide index')
        this.player?.pause()
        this.slide = index
        const section = PRESENTATION_SECTIONS[index]
        this.render()
        if(section.zone && this.navigate && this.visible && !this.raceChapter)
        {
            try
            {
                const navigated = await this.navigate(section.zone)
                if(!navigated && this.visible && this.slide === index)
                    this.feedback('Perpindahan zona belum tersedia; materi tetap bisa dipelajari.')
            }
            catch(error)
            {
                if(this.visible && this.slide === index) this.feedback(`Zona belum siap: ${error.message}`)
            }
        }
    }

    setRaceChapter(active)
    {
        this.raceChapter=active
        this.root.classList.toggle('co-learning--race',active)
    }

    computeExperiment()
    {
        return {
            baseline:runRoundRobin(this.experimentProblem),
            aco:runACO(this.experimentProblem,{seed:this.experiment.seed,iterations:this.experiment.iterations,ants:12,trace:false})
        }
    }

    updateExperimentDisclosure()
    {
        const panel=$(this.root,'.co-experiment-body')
        const toggle=$(this.root,'[data-action="experiment-toggle"]')
        panel.hidden=!this.experimentExpanded
        toggle.setAttribute('aria-expanded',String(this.experimentExpanded))
        toggle.textContent=this.experimentExpanded?'▲ Sembunyikan':'⚙ Atur'
    }

    renderExperiment()
    {
        for(const key of ['taskCount','vmCount','iterations']) $(this.root,`[data-experiment="${key}"]`).value=String(this.experiment[key])
        const {taskCount,vmCount,iterations}=this.experiment
        const {baseline,aco}=this.experimentRuns
        $(this.root,'.co-experiment-current').textContent=`Aktif: ${taskCount} task · ${vmCount} VM · ${iterations} iterasi | ACO: ${fmt(aco.metrics.makespan)} s`
        $(this.root,'.co-experiment-result').textContent=`${taskCount} task · ${vmCount} VM · ${iterations} iterasi | Round Robin: ${fmt(baseline.metrics.makespan)} s | ACO: ${fmt(aco.metrics.makespan)} s | Alokasi terbaik: ${aco.bestAssignment.map((vm,i)=>`T${i+1}→VM${vm+1}`).join(', ')}`
    }

    applyExperiment(reset=false)
    {
        const config=reset?{...EXPERIMENT_DEFAULTS,seed:this.seed}:{
            taskCount:Number($(this.root,'[data-experiment="taskCount"]').value),
            vmCount:Number($(this.root,'[data-experiment="vmCount"]').value),
            iterations:Number($(this.root,'[data-experiment="iterations"]').value),
            seed:this.seed
        }
        try
        {
            const valid=validateExperimentConfig(config)
            const problem=createExperimentProblem(valid)
            // Recompute before touching the running 3D scene.
            const baseline=runRoundRobin(problem)
            const aco=runACO(problem,{seed:valid.seed,iterations:valid.iterations,ants:12,trace:false})
            this.player?.pause()
            this.worlds.cloud?.setExperimentConfig(valid)
            this.worlds.aco?.setExperimentConfig(valid)
            this.experiment=valid
            this.experimentProblem=problem
            this.experimentRuns={baseline,aco}
            this.render()
            this.experimentExpanded=false
            this.updateExperimentDisclosure()
            this.feedback(`Konfigurasi aktif: ${valid.taskCount} task, ${valid.vmCount} VM, ${valid.iterations} iterasi. Tekan Langkah untuk melihat simulasi.`)
        }
        catch(error){this.feedback(`Konfigurasi tidak dapat diterapkan: ${error.message}`)}
    }

    setupLesson(algorithm)
    {
        const config=algorithm==='gwo'?{seed:this.seed,iterations:this.demoIterations,wolves:12}
            :{problem:this.experimentProblem,...(algorithm==='aco'?{seed:this.experiment.seed,iterations:Math.min(this.demoIterations,this.experiment.iterations),ants:12,sampledAnt:1}:{})}
        this.player?.dispose()
        this.lesson = createLesson(algorithm, config)
        let adapter = null
        const world = this.worlds[algorithm]
        if(world) adapter = createWorldAdapter(algorithm, world)
        this.player = new LessonPlayer(this.lesson, {
            adapter, onChange: snapshot => this.renderStep(snapshot)
        })
        this.player.reset()
        $(this.root, '.co-world-connection').textContent = world ? 'adapter disambungkan' : 'belum disambungkan (panel tetap interaktif)'
        this.renderStep(this.player.snapshot())
    }

    render()
    {
        const section = PRESENTATION_SECTIONS[this.slide]
        $(this.root, '.co-eyebrow').textContent = section.eyebrow
        $(this.root, '.co-title').textContent = section.title
        $(this.root, '.co-question').textContent = section.question
        $(this.root, '.co-explanation').textContent = section.explanation
        $(this.root, '.co-takeaway p').textContent = section.takeaway
        $(this.root, '.co-slide-count').textContent = `${this.slide + 1} / ${PRESENTATION_SECTIONS.length}`
        $(this.root, '[data-action="previous"]').disabled = this.slide === 0
        $(this.root, '[data-action="next"]').disabled = this.slide === PRESENTATION_SECTIONS.length - 1
        $(this.root, '.co-feedback').textContent = ''
        for(const [i, button] of [...this.root.querySelectorAll('.co-nav-item')].entries())
        {
            button.classList.toggle('is-current', i === this.slide)
            if(i === this.slide) button.setAttribute('aria-current', 'step')
            else button.removeAttribute('aria-current')
        }
        $(this.root, '.co-simulation').hidden = !['problem', 'aco', 'gwo'].includes(section.id)
        $(this.root, '.co-comparison').hidden = section.id !== 'results'
        $(this.root, '.co-experiment').hidden = !['problem','aco'].includes(section.id)
        const standard=this.experiment.taskCount===8&&this.experiment.vmCount===3&&this.experiment.iterations===50
        $(this.root,'.co-config-scope').hidden = standard||!['gwo','results'].includes(section.id)
        if(['problem','aco'].includes(section.id))this.renderExperiment()
        $(this.root, '.co-papers').hidden = section.id !== 'paper'
        if(section.id === 'problem') this.setupLesson('cloud')
        if(section.id === 'aco') this.setupLesson('aco')
        const colonyControl=$(this.root,'[data-action="aco-display-mode"]')
        colonyControl.hidden=section.id!=='aco'
        colonyControl.textContent=this.acoDisplayMode==='colony'?'🐜 Mode Koloni: 12 semut':'🔎 Mode Fokus: 1 semut'
        if(section.id==='aco')this.worlds.aco?.setColonyMode?.(this.acoDisplayMode)
        if(section.id === 'gwo') this.setupLesson('gwo')
        if(section.id === 'results') this.renderResults()
        if(section.id === 'paper') this.renderPapers()
    }

    renderStep(snapshot)
    {
        const count = $(this.root, '.co-step-count')
        count.textContent = `${snapshot.cursor} / ${snapshot.total}`
        const { headline, lines } = lessonDetail(snapshot.step, this.lesson?.problem)
        $(this.root, '.co-step-title').textContent = headline
        $(this.root, '.co-step-summary').textContent = snapshot.step?.explanation ?? 'Klik Langkah untuk memulai visualisasi. Setiap langkah menggunakan keputusan engine yang sebenarnya.'
        const container = $(this.root, '.co-step-details')
        container.replaceChildren(...lines.map(line => {
            const item = document.createElement('p')
            item.textContent = line
            return item
        }))
        $(this.root, '[data-action="step"]').disabled = snapshot.status === 'finished'
        $(this.root, '[data-action="pause"]').disabled = snapshot.status !== 'playing'
        $(this.root, '[data-action="play"]').textContent = snapshot.status === 'finished' ? '↻ Play lagi' : '▶ Play'
    }

    renderResults()
    {
        const metrics = $(this.root, '.co-metrics')
        metrics.replaceChildren(...this.comparison.rows.map(row => {
            const card = document.createElement('article')
            card.className = `co-metric co-metric--${row.id}`
            const label = document.createElement('span')
            label.textContent = row.name
            const value = document.createElement('strong')
            value.textContent = `${fmt(row.metrics.makespan)} s`
            const detail = document.createElement('small')
            detail.textContent = `Biaya ${fmt(row.metrics.cost, 6)} · Utilisasi (proxy) ${fmt(row.metrics.meanUtilizationProxy * 100, 1)}% · Evaluasi ${row.fitnessEvaluations}`
            card.append(label, value, detail)
            return card
        }))
        const rows = this.comparison.rows.filter(row => row.bestSoFar)
        const vals = rows.flatMap(row => row.bestSoFar)
        const min = Math.min(...vals), max = Math.max(...vals)
        const svg = document.createElementNS(CHART_NS, 'svg')
        svg.setAttribute('viewBox', '0 0 404 170')
        svg.setAttribute('role', 'img')
        svg.setAttribute('aria-label', `Konvergensi makespan ACO dan GWO selama ${this.iterations} iterasi. ACO akhir ${fmt(rows[0].metrics.makespan)}, GWO akhir ${fmt(rows[1].metrics.makespan)} detik.`)
        for(const [rowIndex, row] of rows.entries())
        {
            const line = document.createElementNS(CHART_NS, 'polyline')
            line.setAttribute('fill', 'none')
            line.setAttribute('stroke', rowIndex === 0 ? '#d57e43' : '#4c948c')
            line.setAttribute('stroke-width', '3.5')
            line.setAttribute('stroke-linejoin', 'round')
            const points = convergencePolyline(row.bestSoFar, { width: 380, height: 120, min, max })
            line.setAttribute('points', points.map(p => `${(p.x + 12).toFixed(2)},${(p.y + 10).toFixed(2)}`).join(' '))
            svg.appendChild(line)
        }
        const plot = $(this.root, '.co-plot')
        plot.replaceChildren(svg)
        const legend = document.createElement('p')
        legend.className = 'co-legend'
        legend.textContent = `ACO (oranye): ${fmt(rows[0].metrics.makespan)} s · GWO (hijau): ${fmt(rows[1].metrics.makespan)} s`
        plot.appendChild(legend)
        const table = document.createElement('table')
        table.className = 'co-assignment-table'
        const head = document.createElement('thead')
        const headRow = document.createElement('tr')
        for(const name of ['Task', 'RR', 'ACO', 'GWO']) {
            const cell = document.createElement('th'); cell.textContent = name; headRow.appendChild(cell)
        }
        head.appendChild(headRow)
        const body = document.createElement('tbody')
        for(const [i, task] of this.comparison.dataset.tasks.entries())
        {
            const tr = document.createElement('tr')
            const values = [task.id, ...this.comparison.rows.map(r => this.comparison.dataset.vms[r.assignment[i]].id)]
            for(const value of values) { const td = document.createElement('td'); td.textContent = value; tr.appendChild(td) }
            body.appendChild(tr)
        }
        table.append(head, body)
        $(this.root, '.co-assignments').replaceChildren(table)
    }

    renderPapers()
    {
        const list = $(this.root, '.co-paper-list')
        list.replaceChildren(...PAPERS.map(paper => {
            const article = document.createElement('article'); article.className = 'co-paper'
            const title = document.createElement('strong'); title.textContent = `${paper.algorithm} · ${paper.author} (${paper.year})`
            const link = document.createElement('a'); link.href = paper.doi; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = paper.title
            const note = document.createElement('small'); note.textContent = paper.note
            article.append(title, link, note)
            return article
        }))
    }

    feedback(message) { $(this.root, '.co-feedback').textContent = message }

    handleClick(event)
    {
        const trigger = event.target.closest('[data-action]')
        if(!trigger || !this.root.contains(trigger) || !this.visible) return
        const action = trigger.dataset.action
        if(this.raceChapter&&['slide','previous','next'].includes(action))return
        if(action === 'experiment-toggle'){
            this.experimentExpanded=!this.experimentExpanded
            this.updateExperimentDisclosure()
        }
        else if(action === 'aco-display-mode'){
            this.acoDisplayMode=this.acoDisplayMode==='colony'?'focus':'colony'
            this.worlds.aco?.setColonyMode?.(this.acoDisplayMode)
            const button=$(this.root,'[data-action="aco-display-mode"]')
            button.textContent=this.acoDisplayMode==='colony'?'🐜 Mode Koloni: 12 semut':'🔎 Mode Fokus: 1 semut'
            this.feedback(this.acoDisplayMode==='colony'?'Koloni: 12 semut mengikuti keputusan engine untuk task yang sama.':'Fokus: satu semut contoh ditampilkan agar probabilitas mudah dipahami.')
        }
        else if(action === 'experiment-apply') this.applyExperiment(false)
        else if(action === 'experiment-default') this.applyExperiment(true)
        else if(action === 'close') this.close()
        else if(action === 'slide') void this.goTo(Number(trigger.dataset.index))
        else if(action === 'previous') void this.goTo(Math.max(0, this.slide - 1))
        else if(action === 'next') void this.goTo(Math.min(PRESENTATION_SECTIONS.length - 1, this.slide + 1))
        else if(action === 'step' || action === 'play' || action === 'pause' || action === 'reset')
        {
            if(!this.player) return
            try
            {
                if(action === 'step') this.player.step()
                if(action === 'play')
                {
                    const aco=this.lesson?.algorithm==='aco'
                    if(aco)this.worlds.aco?.setPaused?.(false)
                    this.player.play(aco ? 1350 : this.delay)
                }
                if(action === 'pause')
                {
                    this.player.pause()
                    if(this.lesson?.algorithm==='aco')this.worlds.aco?.setPaused?.(true)
                }
                if(action === 'reset') this.player.reset()
            }
            catch(error)
            {
                this.player.pause()
                this.feedback(`Simulasi dihentikan: ${error.message}`)
            }
        }
    }
}
