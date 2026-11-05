// View-only comparisons use stable optimizer IDs, never the physical/ranked row index.
export function candidateView(state, previous=null, {guides=null,preview=false}={}){
 if(!state)return null
 const old=new Map(previous?.candidates.map(c=>[c.id,c])||[])
 return {
  iteration:state.iteration,bestMakespan:state.bestMakespan,preview,
  guides:guides?Object.fromEntries(['alpha','beta','delta'].map(role=>[role,guides[role]?.id??guides[role]??null])):null,
  rows:state.candidates.map((c,index)=>{
   const before=old.get(c.id)
   return {index:index+1,id:c.id,role:Object.entries(state.leaders).find(([,id])=>id===c.id)?.[0]||null,
    fitness:c.fitness,assignment:[...c.assignment],comparison:before?'compared':previous?'newly-visible':'initial',
    changed:c.assignment.map((vm,i)=>before?vm!==before.assignment[i]:null)}
  })
 }
}
