// Renderer-independent validation. A wolf is a complete eight-task schedule.
export function validateState(state) {
 const assignment=a=>Array.isArray(a)&&a.length===8&&a.every(v=>Number.isInteger(v)&&v>=0&&v<3)
 if(!state||!Number.isInteger(state.iteration)||state.iteration<0||!Array.isArray(state.candidates)||state.candidates.length!==5)throw new TypeError('Expected iteration and five candidates')
 const ids=new Set()
 for(const c of state.candidates){if(typeof c.id!=='string'||!c.id||ids.has(c.id)||!assignment(c.assignment)||!Number.isFinite(c.fitness)||c.fitness<0)throw new TypeError('Invalid candidate');ids.add(c.id)}
 const leaders=['alpha','beta','delta'].map(k=>state.leaders?.[k])
 if(new Set(leaders).size!==3||leaders.some(id=>!ids.has(id))||!assignment(state.bestAssignment)||!Number.isFinite(state.bestMakespan)||state.bestMakespan<0)throw new TypeError('Invalid leaders or best solution')
 return structuredClone(state)
}
export const previewState={iteration:0,candidates:Array.from({length:5},(_,i)=>({id:`wolf-${i+1}`,assignment:Array.from({length:8},(_,j)=>(i+j)%3),fitness:12+i})),leaders:{alpha:'wolf-1',beta:'wolf-2',delta:'wolf-3'},bestAssignment:[0,1,2,0,1,2,0,1],bestMakespan:12}

export function optimizerState(input){
 const candidates=[...input.candidates].sort((a,b)=>a.fitness-b.fitness||a.id.localeCompare(b.id)).slice(0,5);
 return validateState({...input,candidates,leaders:Object.fromEntries(Object.entries(input.leaders).map(([role,value])=>[role,typeof value==='string'?value:value.id]))});
}
