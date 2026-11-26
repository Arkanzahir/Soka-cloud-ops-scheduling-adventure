import * as T from 'three/webgpu'
import { mountAntModels } from '../aco/AntModel.js'
import { YardKit } from '../cloud/YardKit.js'
import { DEFAULT_PROBLEM } from '../scheduling/problem.js'
import { HYBRID_MODES } from '../scheduling/hybrid.js'
import { Trees } from '../../Game/World/Trees.js'

const VM_X = [-3.6, 0, 3.6]
const VM_MATERIALS = ['blue', 'coral', 'sage']
const LAB = 'Hybrid Scheduling Lab'
const CENTER_X = 0
const CENTER_Z = 104
const CAMPUS_GATE = { position: [48, 32], rotation: 0 }
const SPAN = { x: 17.5, z: 13 }
const fmt = value => value.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

export class HybridWorld
{
    constructor(manager)
    {
        this.manager = manager
        this.game = manager.game
        this.group = new T.Group()
        this.group.name = 'hybrid-scheduling-lab'
        this.group.position.set(CENTER_X,0,CENTER_Z)
        this.group.visible = false
        this.game.scene.add(this.group)
        this.kit = new YardKit({game: this.game, objects: {hideable: []}})
        this.tasks = []
        this.pads = []
        this.routes = []
        this.build()
        this.setMode('aco')
        this.register()
        this.focus = new T.Vector3(CENTER_X+1.8,0,CENTER_Z-4.2)
        this.game.ticker.events.on('tick', () => this.frameView(), 6)
        this.game.ticker.events.on('tick', () => {
            const active = manager.currentZone === 'hybrid'
            this.group.visible = active
            if(active) this.update(this.game.ticker.delta)
        }, 10)
    }

    box(x, y, z, width, height, depth, material, parent = this.group)
    {
        return this.kit.rounded(x, y, z, width, height, depth, material, parent)
    }

    collider(x, y, z, width, height, depth, category = 'object')
    {
        this.game.objects.add(null, {
            type: 'fixed', friction: .7, position: {x: CENTER_X + x, y, z: CENTER_Z + z},
            colliders: [{shape: 'cuboid', parameters: [width / 2, height / 2, depth / 2], category}]
        })
    }

    label(text, x, y, z, width, height, parent = this.group)
    {
        const label = this.kit.label(text, x, y, z, width, height)
        parent.add(label.mesh)
        return label
    }

    mesh(geometry, material, x, y, z, parent = this.group)
    {
        return this.kit.mesh(geometry, material, new T.Vector3(x, y, z), parent)
    }

    build()
    {
        const floor = this.kit.path(0, 0, SPAN.x * 2, SPAN.z * 2)
        this.group.add(floor)
        this.box(0, -.55, 0, 35, 1.08, 26, 'wood')
        this.collider(0, -.55, 0, 35, 1.1, 26, 'floor')
        this.box(0, .035, 7.6, 31.5, .07, 5.2, 'sand')
        this.box(0, .04, 1.4, 10.8, .08, 7.3, 'sand')
        for(const [x,z,w,d] of [[0,-12.8,35,.26], [0,12.8,35,.26], [-17.3,0,.26,26], [17.3,0,.26,26]])
        {
            this.collider(x,.67,z,w,1.34,d)
            for(const y of [.54,1.05]) this.box(x,y,z,w,.17,d,'wood')
            const postCount = Math.ceil(Math.max(w,d) / 3)
            for(let i = 0; i <= postCount; i++)
            {
                const along = i / postCount - .5
                this.box(x + (w > d ? w * along : 0),.66,z + (d > w ? d * along : 0),.24,1.3,.24,'wood')
            }
        }
        this.plantTrees()
        this.buildDispatch()
        this.buildAntStation()
        this.buildChromosomeStation()
        this.sign('HYBRID SCHEDULING LAB', 0, 4.25, -8.7, 10.6, 'dark')
        this.sign('Penyortiran task · E / ENTER', -8.6, 2, 5.8, 5.45, 'wood')
        this.sign('KEMBALI · E / ENTER', 9.2, 1.8, 7.1, 4.9, 'wood')
        this.phase = this.sign('', 0, 3.25, -8.5, 9.25, 'wood', .48)
        this.decision = this.label('', 0, 2.77, -8.38, 8.8, .4)
    }

    sign(text, x, y, z, width, material, height = .72)
    {
        this.box(x,y,z,width+.22,height+.2,.18,material)
        for(const direction of [-1,1])
            this.box(x + direction * width * .43, y / 2,z,.16,y,.16,'wood')
        return this.label(text,x,y,z+.1,width,height)
    }

    plantTrees()
    {
        const references = [[-15,-9],[-13,-10],[12,-10],[15,-8],[-15,4],[15,3]].map(([x,z]) => {
            const reference = new T.Object3D()
            reference.position.set(CENTER_X + x,0,CENTER_Z + z)
            reference.scale.setScalar(.62)
            reference.updateMatrixWorld()
            return reference
        })
        const trees = new Trees('Hybrid oak trees', this.game.resources.oakTreesVisualModel.scene.clone(true),
            references, '#b4b536', '#d8cf3b')
        this.group.attach(trees.bodies)
        this.group.attach(trees.leaves.mesh)
    }

    buildDispatch()
    {
        this.box(0,.19,-4.7,11.1,.38,3.15,'wood')
        this.collider(0,.62,-4.9,11.1,1.24,2.8)
        DEFAULT_PROBLEM.vms.forEach((vm, index) => {
            const x = VM_X[index], material = VM_MATERIALS[index]
            this.box(x,1.13,-4.7,2.46,1.52,1.55,'dark')
            this.box(x,1.94,-4.7,2.52,.17,1.63,material)
            for(let row = 0; row < 3; row++)
            {
                this.box(x,.75 + row*.32,-3.91,1.82,.15,.09,'wood')
                this.box(x-.69,.75 + row*.32,-3.85,.14,.10,.055,material)
            }
            this.label(`${vm.id} · ${vm.mips} MIPS`,x,2.28,-4.44,2.58,.5)
            const base = this.box(x,.13,-1.47,2.8,.16,2.48,'wood')
            const active = this.box(x,.22,-1.47,2.71,.055,2.39,material)
            const load = this.label('',x,.38,-.14,2.35,.43)
            this.pads.push({base, active, load})
        })
        this.box(0,.16,3.05,10.2,.26,1.4,'wood')
        DEFAULT_PROBLEM.tasks.forEach((task,index) => {
            const group = new T.Group()
            group.position.set((index-3.5)*1.18,.36,3.05)
            this.group.add(group)
            const crate = this.box(0,0,0,1.02,.48,.98,'coral',group)
            const badge = this.label(`${task.id}\n${task.lengthMI} MI`,0,.245,0,.89,.86,group)
            badge.mesh.rotation.x = -Math.PI / 2
            this.tasks.push({group, crate, home: group.position.clone(), target: group.position.clone()})
        })
        this.label('ANTREAN TASK',0,.35,3.78,3.2,.48)
        const bench = this.game.world.benches.instancedGroup.group.clone(true)
        bench.position.set(-11.8,0,8.8)
        bench.rotation.y = Math.PI
        this.group.add(bench)
    }

    buildAntStation()
    {
        this.sign('MAX-MIN → ACO',-10.6,3.17,-7.6,6.7,'sage')
        const moundX = -11, moundZ = -4.8
        for(const [top,bottom,height,y] of [[2.38,2.85,.48,.24],[1.57,2.4,.78,.87],[.38,1.59,1.0,1.76]])
            this.mesh(new T.CylinderGeometry(top,bottom,height,11),'wood',moundX,y,moundZ)
        const mouth = this.mesh(new T.SphereGeometry(.64,10,7),'dark',moundX,.43,moundZ+2.65)
        mouth.scale.set(1,.78,.26)
        this.collider(moundX,.8,moundZ,4.9,1.6,4.25)
        const rock = new T.DodecahedronGeometry(.31,0)
        for(let i = 0; i < 13; i++)
        {
            const angle = i * Math.PI / 7
            if(angle > .9 && angle < 2.14) continue
            const pebble = this.mesh(rock,i % 3 ? 'wood' : 'cream',moundX + Math.cos(angle)*3,.13,moundZ + Math.sin(angle)*3)
            pebble.rotation.y = i
        }
        this.antHome = new T.Vector3(moundX,.14,moundZ+3.05)
        this.fork = new T.Vector3(-6.5,.15,-.9)
        const trunk = new T.LineCurve3(this.antHome,this.fork)
        this.mesh(new T.TubeGeometry(trunk,8,.038,5,false),'sage',0,0,0)
        VM_X.forEach((x,index) => {
            const end = new T.Vector3(x,.17,-.02)
            const curve = new T.CatmullRomCurve3([this.fork,new T.Vector3(x-.6,.16,.82 + index*.43),end])
            const trail = this.mesh(new T.TubeGeometry(curve,24,.042,5,false),'sage',0,0,0)
            const lights = [.25,.5,.75].map((t,i) => {
                const p = curve.getPointAt(t)
                return this.mesh(new T.SphereGeometry(.09,8,5),i===1 ? 'cream' : 'sage',p.x,p.y,p.z)
            })
            const path = new T.CurvePath()
            path.add(trunk)
            path.add(curve)
            this.routes.push({trail, lights, curve: path})
        })
        const model = new T.Group()
        model.position.copy(this.antHome)
        this.group.add(model)
        const antBody = new T.SphereGeometry(.2,8,6)
        for(const offset of [-.25,0,.22])
            this.mesh(antBody,'dark',0,.15,offset,model)
        this.ant = {mesh: model, antId: 1}
        this.game.resourcesLoader.load([['ant','campus/animals/ant.glb','gltf']])
            .then(({ant}) => mountAntModels([this.ant],ant))
            .catch(error => console.warn('Hybrid ant model fallback',error))
    }

    buildChromosomeStation()
    {
        this.sign('MIN-MIN → GA',10.75,3.17,-7.6,6.7,'coral')
        this.box(10.45,.54,-3.85,8.66,1.05,3.22,'wood')
        this.collider(10.45,.54,-3.85,8.66,1.05,3.22)
        const geometry = new T.BoxGeometry(.72,.28,.48)
        this.chromosome = Array.from({length: 3}, (_, row) => {
            const z = -4.80+row*.81
            const label = this.label('',7.07,1.066,z,1.14,.64)
            label.mesh.rotation.x = -Math.PI/2
            const cells = this.tasks.map((_,task) => this.mesh(geometry,'cream',8.21+task*.81,1.16,z))
            return {label, cells}
        })
        this.label('GEN T1–T8 · WARNA VM',10.55,1.65,-2.19,6.6,.54)
    }

    register()
    {
        const manager = this.manager
        const spawn = {position: [CENTER_X, CENTER_Z + 8.2], rotation: Math.PI / 2}
        manager.register({ id: 'hybrid', name: LAB, center: [CENTER_X, CENTER_Z], radius: 22, spawn })
        const entry = manager.findReturnCheckpoint(CAMPUS_GATE)
        if(entry)
        {
            const [x,z] = entry.position
            const y = manager.transitions.safeSpawn(entry).y - .2
            this.entry = manager.createStation({ zone: 'main', label: LAB, position: [x,y,z],
                onInteract: () => manager.enter('hybrid') })
        }
        const category = () => manager.drivingCategory()
        this.station = manager.createStation({ zone: 'hybrid', label: 'Simulasi Hybrid', position: [CENTER_X-6.9,1.5,CENTER_Z+7.6],
            category, onInteract: () => this.onLearn?.() })
        this.exit = manager.createStation({ zone: 'hybrid', label: 'Kembali', position: [CENTER_X+7.25,1.5,CENTER_Z+8.2],
            category, onInteract: async () => {
                if(await manager.enter('main',false,category())) this.onLeave?.()
            } })
    }

    frameView()
    {
        const { view, player, physicalVehicle } = this.game
        const active = this.manager.currentZone === 'hybrid'
        if(active && !this.previousZoom)
        {
            this.previousZoom = {ratio: view.zoom.baseRatio, max: view.spherical.radius.edges.max}
            view.zoom.baseRatio = .1
            view.spherical.radius.edges.max = 48
        }
        else if(!active && this.previousZoom)
        {
            view.zoom.baseRatio = this.previousZoom.ratio
            view.spherical.radius.edges.max = this.previousZoom.max
            this.previousZoom = null
        }
        if(active && Math.abs(physicalVehicle.speed) < 2 &&
            player.position.z - CENTER_Z > 4 && Math.abs(player.position.x - CENTER_X) < 11)
            view.focusPoint.trackedPosition.lerp(this.focus,.83)
    }

    setMode(mode)
    {
        this.mode = mode
        this.resetVisualization()
    }

    resetVisualization()
    {
        const { title } = HYBRID_MODES[this.mode]
        this.phase.write(`${title} · Susun jadwal awal`)
        this.decision.write('Waktu selesai = waktu eksekusi + antrean VM')
        for(const task of this.tasks)
        {
            task.group.position.copy(task.home)
            task.target.copy(task.home)
            task.crate.material = this.kit.materials.coral
        }
        for(const pad of this.pads)
        {
            pad.active.visible = false
            pad.load.write('0,00 dtk')
        }
        this.ant.mesh.position.copy(this.antHome)
        this.ant.mesh.visible = this.mode === 'aco'
        this.antMove = null
        this.setPheromone(null)
        this.drawChromosomes([])
    }

    setPheromone(weights)
    {
        for(const [vm, route] of this.routes.entries())
        {
            const active = this.mode === 'aco'
            route.trail.visible = active
            const relative = weights ? weights[vm] / Math.max(...weights) : 0
            for(const [index,light] of route.lights.entries())
            {
                light.visible = active && relative > index / 3
                light.scale.setScalar(.65 + relative * .9)
            }
        }
    }

    drawChromosomes(rows)
    {
        for(const [index,{label,cells}] of this.chromosome.entries())
        {
            const row = rows[index]
            label.write(row?.title ?? '—')
            cells.forEach((cell,task) => {
                const vm = row?.assignment[task]
                cell.material = this.kit.materials[VM_MATERIALS[vm] ?? 'cream']
                cell.scale.y = row?.highlight?.includes(task) ? 1.8 : 1
            })
        }
    }

    applyStep(step)
    {
        const event = step.source
        const counts = VM_X.map(() => 0)
        this.phase.write(step.title)
        if(event.completion)
            this.decision.write(event.completion[event.taskIndex].map((time,vm) =>
                `VM${vm+1}: ${fmt(time)} dtk`).join('   ·   '))
        else if(event.metrics)
            this.decision.write(`Makespan ${fmt(event.metrics.makespan)} dtk`)
        else this.decision.write('Gen menunjukkan VM tujuan untuk setiap task')
        for(const [index, task] of this.tasks.entries())
        {
            const vm = event.assignment[index]
            task.crate.material = this.kit.materials[VM_MATERIALS[vm] ?? 'coral']
            if(vm < 0)
            {
                task.target.copy(task.home)
                continue
            }
            const slot = counts[vm]++
            task.target.set(VM_X[vm] + (slot % 3 - 1)*.92,.47 + Math.floor(slot / 6)*.47,-.85 - Math.floor(slot / 3) % 2 * 1.03)
        }
        const loads = event.loads ?? event.metrics?.vmLoads
        for(const [vm,pad] of this.pads.entries())
        {
            pad.active.visible = vm === event.vmIndex || (event.type === 'ant' && vm === event.assignment[0])
            pad.load.write(loads ? `${fmt(loads[vm])} dtk` : '—')
        }
        if(event.pheromone) this.setPheromone(event.pheromone[0])
        if(event.type === 'ant')
        {
            this.antMove = {curve: this.routes[event.assignment[0]].curve, time: 0}
            this.ant.mesh.position.copy(this.antHome)
        }
        if(event.mode === 'ga' && event.type !== 'allocation')
        {
            const parents = event.parents?.map((assignment,index) => ({title: index === 0 ? 'Induk A' : 'Induk B', assignment})) ?? []
            this.drawChromosomes([...parents, {
                title: event.type === 'chromosome-seed' ? 'Awal' : ['mutation','crossover'].includes(event.type) ? 'Anak' : 'Terbaik',
                assignment: event.assignment,
                highlight: event.mutations ?? (event.point === null || event.point === undefined ? [] :
                    event.assignment.map((_,index) => index).slice(event.point))
            }])
        }
    }

    update(delta)
    {
        for(const task of this.tasks)
            if(task.group.position.distanceToSquared(task.target) > 1e-5)
                task.group.position.lerp(task.target,1 - Math.exp(-7 * delta))
        if(!this.antMove) return
        const move = this.antMove
        move.time = Math.min(1,move.time + delta / 1.6)
        move.curve.getPointAt(move.time,this.ant.mesh.position)
        const direction = move.curve.getTangentAt(move.time)
        this.ant.mesh.rotation.y = Math.atan2(direction.x,direction.z)
        this.ant.walkMixer?.update(delta)
        if(move.time === 1) this.antMove = null
    }
}
