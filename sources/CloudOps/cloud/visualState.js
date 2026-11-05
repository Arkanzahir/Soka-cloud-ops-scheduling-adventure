// Default 8-task/3-VM contracts remain unchanged; explicit dimensions enable ACO experiments.
const index=(value,count)=>Number.isInteger(value)&&value>=0&&value<count
const loads=(value,vmCount)=>Array.isArray(value)&&value.length===vmCount&&value.every(v=>Number.isFinite(v)&&v>=0)
const dimensions=({taskCount=8,vmCount=3}={})=>{
 if(![4,6,8].includes(taskCount)||![2,3].includes(vmCount))throw new RangeError('Unsupported experiment dimensions')
 return {taskCount,vmCount}
}
export function allocationEvent(input,options){
 const {taskCount,vmCount}=dimensions(options)
 if(!input||!index(input.taskIndex,taskCount))throw new TypeError('taskIndex must be within active task count')
 const vm=input.vmIndex??input.selectedVM
 if(!index(vm,vmCount)||(input.vmIndex!==undefined&&input.selectedVM!==undefined&&input.vmIndex!==input.selectedVM))throw new TypeError('VM must be within active count; aliases must agree')
 if(input.taskId!==undefined&&input.taskId!==`T${input.taskIndex+1}`)throw new TypeError('taskId does not match taskIndex')
 if(!Number.isFinite(input.executionTime)||input.executionTime<0||!loads(input.vmLoads,vmCount))throw new TypeError('Execution time and VM loads must be finite nonnegative seconds')
 if(input.step!==undefined&&(!Number.isInteger(input.step)||input.step<0))throw new TypeError('Invalid step')
 if(input.partialAssignment!==undefined&&(!Array.isArray(input.partialAssignment)||input.partialAssignment.length>taskCount||input.partialAssignment.some(v=>v!==null&&!index(v,vmCount))||input.partialAssignment[input.taskIndex]!==vm))throw new TypeError('Invalid partial assignment')
 return {...input,vmIndex:vm,selectedVM:vm,vmLoads:[...input.vmLoads],partialAssignment:input.partialAssignment?[...input.partialAssignment]:undefined}
}
export function scheduleState(input,options){
 const {taskCount,vmCount}=dimensions(options)
 if(!input||!Array.isArray(input.assignments)||input.assignments.length!==taskCount||!input.assignments.every(v=>index(v,vmCount))||!loads(input.vmLoads,vmCount)||!Number.isFinite(input.makespan)||input.makespan<0||Math.abs(input.makespan-Math.max(...input.vmLoads))>1e-5)throw new TypeError('Expected valid assignments, VM loads and makespan=max(loads)')
 return structuredClone(input)
}
