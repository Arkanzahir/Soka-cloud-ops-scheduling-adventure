import test from 'node:test'
import assert from 'node:assert/strict'
import {candidateView} from '../sources/CloudOps/gwo/candidateView.js'
import {optimizerState} from '../sources/CloudOps/gwo/state.js'
import {createLesson} from '../sources/CloudOps/simulation/SimulationBridge.js'

test('candidate board replays real GWO assignments, current makespans and pre-update guides',()=>{
 let previous=null
 for(const {source:e}of createLesson('gwo',{iterations:8}).timeline){
  const state=optimizerState({...e,candidates:e.wolves,bestMakespan:e.bestSoFar})
  const view=candidateView(state,previous,{guides:e.guides})
  assert.equal(view.bestMakespan,e.bestSoFar)
  assert.deepEqual(view.guides,Object.fromEntries(Object.entries(e.guides).map(([k,v])=>[k,v.id])))
  for(const row of view.rows){
   const actual=e.wolves.find(w=>w.id===row.id),old=previous?.candidates.find(w=>w.id===row.id)
   assert.deepEqual(row.assignment,actual.assignment);assert.equal(row.fitness,actual.fitness)
   assert.equal(row.role,Object.entries(e.leaders).find(([,v])=>v.id===row.id)?.[0]||null)
   assert.deepEqual(row.changed,actual.assignment.map((vm,i)=>old?vm!==old.assignment[i]:null))
  };previous=state
 }
})
test('assignment changes follow candidate ID across rank changes, with no invented diff for newly visible IDs',()=>{
 const {source:e}=createLesson('gwo',{iterations:2}).timeline[0]
 const old=optimizerState({...e,candidates:e.wolves,bestMakespan:e.bestSoFar}),state=structuredClone(old)
 state.candidates.reverse();const changed=state.candidates[1];changed.assignment[3]=(changed.assignment[3]+1)%3
 state.candidates[4].id='previously-outside-top-five'
 const view=candidateView(state,old)
 assert.deepEqual(view.rows[1].changed,Array.from({length:8},(_,i)=>i===3))
 assert.equal(view.rows[0].changed.some(Boolean),false)
 assert.equal(view.rows[4].comparison,'newly-visible');assert.deepEqual(view.rows[4].changed,Array(8).fill(null))
})
test('neutral view contains no fake assignment, and view edits never mutate optimizer state',()=>{
 assert.equal(candidateView(null),null)
 const {source:e}=createLesson('gwo',{iterations:1}).timeline[0]
 const state=optimizerState({...e,candidates:e.wolves,bestMakespan:e.bestSoFar}),snapshot=structuredClone(state)
 const view=candidateView(state);assert.ok(view.rows.every(r=>r.comparison==='initial'&&r.changed.every(x=>x===null)))
 view.rows[0].assignment.fill(99);assert.deepEqual(state,snapshot)
})
