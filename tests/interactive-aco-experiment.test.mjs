import test from 'node:test'
import assert from 'node:assert/strict'
import { EXPERIMENT_DEFAULTS, createExperimentProblem, validateExperimentConfig } from '../sources/CloudOps/learning/ExperimentConfig.js'
import { runACO, runRoundRobin } from '../sources/CloudOps/scheduling/index.js'
import { createLesson } from '../sources/CloudOps/simulation/SimulationBridge.js'
import { allocationEvent, scheduleState } from '../sources/CloudOps/cloud/visualState.js'

test('default interactive ACO problem is the original eight-task, three-VM case',()=>{
 const problem=createExperimentProblem(EXPERIMENT_DEFAULTS)
 assert.equal(problem.tasks.length,8)
 assert.equal(problem.vms.length,3)
 assert.equal(EXPERIMENT_DEFAULTS.iterations,50)
})

test('reject unsupported configuration instead of rendering inaccurate actors',()=>{
 assert.throws(()=>validateExperimentConfig({taskCount:9,vmCount:3,iterations:50,seed:42}),RangeError)
 assert.throws(()=>validateExperimentConfig({taskCount:8,vmCount:4,iterations:50,seed:42}),RangeError)
 assert.throws(()=>validateExperimentConfig({taskCount:8,vmCount:3,iterations:0,seed:42}),RangeError)
})

for(const taskCount of [4,6,8])for(const vmCount of [2,3])for(const iterations of [10,25,50])
 test(`${taskCount} tasks, ${vmCount} VMs, ${iterations} iterations share one valid scheduling problem`,()=>{
  const config={taskCount,vmCount,iterations,seed:42}
  const problem=createExperimentProblem(config)
  const aco=runACO(problem,{seed:config.seed,iterations:config.iterations,ants:12,trace:false})
  const rr=runRoundRobin(problem)
  assert.equal(aco.bestAssignment.length,taskCount)
  assert.equal(rr.bestAssignment.length,taskCount)
  assert.ok(aco.bestAssignment.every(vm=>vm>=0&&vm<vmCount))
  assert.equal(aco.history.length,iterations)
  assert.ok(Number.isFinite(aco.metrics.makespan))
  const demo=createLesson('aco',{problem,seed:42,iterations:4,ants:12,sampledAnt:1})
  assert.equal(demo.timeline.length,4*(taskCount+1))
  for(const step of demo.timeline)if(step.kind==='ant-choice'){
   assert.equal(step.colonyChoices.length,12,'Each displayed task includes every actual ant')
   assert.equal(new Set(step.colonyChoices.map(c=>c.ant)).size,12,'All ants must be distinct')
   for(const choice of step.colonyChoices){
    const original=demo.run.events.find(e=>
     e.type==='aco-choice'&&e.iteration===step.source.iteration&&
     e.taskIndex===step.source.taskIndex&&e.ant===choice.ant)
    assert.ok(original,'Every visible ant must correspond to an engine decision')
    assert.equal(choice.selectedVM,original.selectedVM,'The drawn VM cannot differ from the engine')
    assert.ok(choice.selectedVM<vmCount,'No choice may lead to an inactive VM')
   }
   assert.ok(step.source.selectedVM<vmCount)
   assert.equal(step.source.probabilities.length,vmCount)
   assert.equal(step.source.pheromone.length,vmCount)
  }
  for(const e of rr.events){
   const validated=allocationEvent(e,{taskCount,vmCount})
   assert.equal(validated.vmLoads.length,vmCount)
   assert.ok(validated.vmIndex<vmCount)
  }
  const schedule=scheduleState({assignments:aco.bestAssignment,vmLoads:aco.metrics.vmLoads,makespan:aco.metrics.makespan},{taskCount,vmCount})
  assert.equal(schedule.assignments.length,taskCount)
 })
