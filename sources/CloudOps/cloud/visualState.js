const index=(value,count)=>Number.isInteger(value)&&value>=0&&value<count
const loads=value=>Array.isArray(value)&&value.length===3&&value.every(v=>Number.isFinite(v)&&v>=0)
export function allocationEvent(input){
 if(!input||!index(input.taskIndex,8))throw new TypeError('taskIndex must be 0..7')
 const vm=input.vmIndex??input.selectedVM
 if(!index(vm,3)||(input.vmIndex!==undefined&&input.selectedVM!==undefined&&input.vmIndex!==input.selectedVM))throw new TypeError('VM must be 0..2; aliases must agree')
 if(input.taskId!==undefined&&input.taskId!==`T${input.taskIndex+1}`)throw new TypeError('taskId does not match taskIndex')
 if(!Number.isFinite(input.executionTime)||input.executionTime<0||!loads(input.vmLoads))throw new TypeError('Execution time and three loads must be finite nonnegative seconds')
 if(input.step!==undefined&&(!Number.isInteger(input.step)||input.step<0))throw new TypeError('Invalid step')
 if(input.partialAssignment!==undefined&&(!Array.isArray(input.partialAssignment)||input.partialAssignment.length>8||input.partialAssignment.some(v=>v!==null&&!index(v,3))||input.partialAssignment[input.taskIndex]!==vm))throw new TypeError('Invalid partial assignment')
 return {...input,vmIndex:vm,selectedVM:vm,vmLoads:[...input.vmLoads],partialAssignment:input.partialAssignment?[...input.partialAssignment]:undefined}
}
export function scheduleState(input){if(!input||!Array.isArray(input.assignments)||input.assignments.length!==8||!input.assignments.every(v=>index(v,3))||!loads(input.vmLoads)||!Number.isFinite(input.makespan)||input.makespan<0||Math.abs(input.makespan-Math.max(...input.vmLoads))>1e-5)throw new TypeError('Expected eight assignments, three loads and makespan=max(loads)');return structuredClone(input)}
