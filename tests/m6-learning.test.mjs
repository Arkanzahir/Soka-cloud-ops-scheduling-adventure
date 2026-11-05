import test from 'node:test'
import assert from 'node:assert/strict'
import { createLesson, createWorldAdapter, LessonPlayer } from '../sources/CloudOps/simulation/SimulationBridge.js'
import { optimizerState } from '../sources/CloudOps/gwo/state.js'
import { DEFAULT_PROBLEM, evaluateAssignment } from '../sources/CloudOps/scheduling/index.js'
import { PRESENTATION_SECTIONS, PAPERS, buildComparison, convergencePolyline, fmt, lessonDetail } from '../sources/CloudOps/learning/PresentationContent.js'

const near = (a,b,eps=1e-9) => assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`)

test('M6 has six ordered learning sections with correct zone mapping and plain Indonesian explanations', () => {
  assert.deepEqual(PRESENTATION_SECTIONS.map(s=>s.id), ['opening','problem','aco','gwo','results','paper'])
  assert.deepEqual(PRESENTATION_SECTIONS.map(s=>s.zone), ['main','cloud','aco','gwo',null,null])
  for(const section of PRESENTATION_SECTIONS) {
    assert.ok(section.question.length > 15)
    assert.ok(section.explanation.length > 25)
    assert.ok(section.takeaway.length > 15)
  }
})

test('Comparison model uses M4 results (not manually written scores) and identical 8 task 3 VM dataset', () => {
  const c = buildComparison()
  assert.equal(c.dataset.tasks.length, 8)
  assert.equal(c.dataset.vms.length, 3)
  assert.deepEqual(c.rows.map(x=>x.id), ['round-robin','aco','gwo'])
  near(c.rows[0].metrics.makespan,11.833333333333334)
  assert.equal(c.rows[1].metrics.makespan,c.aco.metrics.makespan)
  assert.equal(c.rows[2].metrics.makespan,c.gwo.metrics.makespan)
  for(const row of c.rows) {
    assert.deepEqual(row.metrics, evaluateAssignment(DEFAULT_PROBLEM,row.assignment))
    assert.ok(row.fitnessEvaluations >= 1)
    assert.equal(row.assignment.length,8)
  }
  assert.equal(c.rows[1].bestSoFar.length,50)
  assert.equal(c.rows[2].bestSoFar.length,50)
  assert.equal(c.rows[0].bestSoFar,null)
})

test('Comparison seed reproducible across repeated rendering', () => {
  const first=buildComparison({seed:73,iterations:5})
  const second=buildComparison({seed:73,iterations:5})
  assert.deepEqual(first.rows,second.rows)
  assert.deepEqual(first.charts,second.charts)
})

test('SVG convergence coordinates represent actual data monotonically in x and scale y as expected', () => {
  const pts=convergencePolyline([12,10,7],{width:300,height:120,min:6,max:12})
  assert.deepEqual(pts.map(p=>p.x),[0,150,300])
  near(pts[0].y,0)
  near(pts[2].y,100)
  assert.throws(()=>convergencePolyline([]))
  assert.throws(()=>convergencePolyline([1,Infinity]))
  assert.throws(()=>convergencePolyline([1],{width:0,height:100}))
})

test('Step explanations show genuine per-task allocation, ACO probabilities and wolf leader scores', () => {
  const cloud=createLesson('cloud')
  assert.match(lessonDetail(cloud.timeline[0]).headline,/T1 → VM1/)
  const aco=createLesson('aco',{ants:4,iterations:2})
  const ant=lessonDetail(aco.timeline.find(s=>s.kind==='ant-choice'))
  assert.match(ant.lines.join(' '),/Probabilitas VM1\/VM2\/VM3/)
  const pheromone=lessonDetail(aco.timeline.find(s=>s.kind==='pheromone-update'))
  assert.match(pheromone.lines.join(' '),/Seluruh semut dievaluasi/)
  const gwo=createLesson('gwo',{wolves:4,iterations:2})
  assert.match(lessonDetail(gwo.timeline[0]).lines.join(' '),/Alpha.*Beta.*Delta/)
})

test('Cloud and ACO describe only the VMs in the active lesson', () => {
  const problem={...DEFAULT_PROBLEM,vms:DEFAULT_PROBLEM.vms.slice(0,2)}
  for(const algorithm of ['cloud','aco']){
    const lesson=createLesson(algorithm,{problem,iterations:1})
    const detail=lessonDetail(lesson.timeline[0],lesson.problem).lines.join(' ')
    assert.match(detail,/VM1\/VM2:/)
    assert.doesNotMatch(detail,/VM3/)
  }
})

test('Reference titles and academic caveats explicitly distinguish baseline vs improved research',()=>{
  assert.equal(PAPERS.length,3)
  for(const paper of PAPERS) {
    assert.match(paper.doi,/^https:\/\/doi\.org\//)
    assert.ok(paper.title.length>10)
    assert.ok(paper.note.length>20)
  }
  assert.match(PAPERS[1].note,/tidak menerapkan crossover\/mutation/)
  assert.equal(fmt(11.833333,2),'11,83')
})

test('GWO explains tied leaders and preserves the historical best across dashboard and 3D payload', () => {
  const lesson = createLesson('gwo', { seed: 42, wolves: 12, iterations: 4 })
  const step = lesson.timeline[3]
  const detail = lessonDetail(step, lesson.problem).lines.join('\n')
  let world
  createWorldAdapter('gwo', { applyOptimizerState: input => { world = optimizerState(input) } }).apply(step)

  assert.equal(world.bestMakespan, 6.5)
  assert.match(detail, /Rekor sejauh ini: 6,50 detik/)
  for(const [role, id] of Object.entries(world.leaders)) {
    const candidate = world.candidates.find(wolf => wolf.id === id)
    assert.equal(candidate.fitness.toFixed(2), '6.73')
    assert.match(detail, new RegExp(`${role} \\(${id}\\) · Fitness saat ini: 6,73 detik`, 'i'))
    assert.deepEqual(candidate.vmLoads, evaluateAssignment(lesson.problem, candidate.assignment).vmLoads)
    assert.ok(detail.includes(candidate.assignment.map((vm, task) => `T${task + 1} → VM${vm + 1}`).join(' · ')))
  }
  assert.match(detail, /Beban: VM1 3,50 s · VM2 6,30 s · VM3 6,73 s/)
  assert.match(detail, /menggunakan jadwal yang sama/)
  assert.match(lessonDetail(lesson.timeline[0]).lines.join(' '), /dibulatkan ke dua desimal/)
})

test('M6 playback can be finished, reset, and replayed without fake 3D adapters',()=>{
  const lesson=createLesson('cloud')
  const player=new LessonPlayer(lesson)
  for(let i=0;i<8;i++) player.step()
  assert.equal(player.snapshot().status,'finished')
  player.reset()
  assert.equal(player.snapshot().cursor,0)
  player.step()
  assert.equal(player.snapshot().cursor,1)
  player.dispose()
})
