import * as THREE from 'three/webgpu'
import { color, texture } from 'three/tsl'
import { MeshDefaultMaterial } from '../../Game/Materials/MeshDefaultMaterial.js'
import { Trees } from '../../Game/World/Trees.js'
import { DEFAULT_PROBLEM } from '../scheduling/index.js'

/**
 * Outdoor Cloud Compute Yard. A visual consumer of scheduling events, NOT an algorithm.
 * The same Bruno game/renderer/vehicle/lighting are reused.
 * World coordinates are a preview parcel and must be inspected in-game before main merge.
 */
export class CloudWorld
{
    constructor(game, { center = [128, -36], problem = DEFAULT_PROBLEM } = {})
    {
        if(!game?.scene || !game?.objects || !game?.ticker) throw new TypeError('CloudWorld needs initialized Bruno Game')
        if(!Array.isArray(center) || center.length !== 2 || !center.every(Number.isFinite))
            throw new TypeError('Center must be two finite world coordinates')
        if(problem.tasks.length !== 8 || problem.vms.length !== 3)
            throw new RangeError('Visual teaching installation currently supports 8 tasks and 3 VMs')
        this.game = game
        this.problem = problem
        this.center = center
        this.origin = new THREE.Vector3(center[0], 0, center[1])
        this.group = new THREE.Group()
        this.group.name = 'Cloud Compute Yard'
        this.group.position.copy(this.origin)
        game.scene.add(this.group)
        this.materials = {}
        for(const [key, hex] of Object.entries({
            sand: '#ffcf8b', soil: '#a87762', grass: '#b8b62e',
            wood: '#98664f', cream: '#fff0bf', ink: '#382c38',
            amber: '#e69b52', sea: '#5bc2b9', plum: '#82487f', moss: '#81953d'
        }))
            this.materials[key] = new MeshDefaultMaterial({ colorNode: color(hex) })
        this.tasks = []
        this.vms = []
        this.elapsed = 0
        this.motion = null
        this.preview = true
        this.build()
        this.resetVisualization()
        this.tick = () => this.update(this.game.ticker.delta)
        game.ticker.events.on('tick', this.tick, 10)
    }

    mesh(geometry, material, x, y, z)
    {
        const item = new THREE.Mesh(geometry, this.materials[material] || material)
        item.position.set(x, y, z)
        item.castShadow = true
        item.receiveShadow = true
        this.group.add(item)
        return item
    }

    box(x, y, z, width, height, depth, material = 'wood', collide = false)
    {
        const item = this.mesh(new THREE.BoxGeometry(width, height, depth), material, x, y, z)
        if(collide) this.collider([x, y, z], [width / 2, height / 2, depth / 2], 'object')
        return item
    }

    collider(position, halfExtents, category)
    {
        this.game.objects.add(null, {
            type: 'fixed', friction: 0.7,
            position: {
                x: this.origin.x + position[0],
                y: position[1],
                z: this.origin.z + position[2]
            },
            colliders: [{ shape: 'cuboid', parameters: halfExtents, category }]
        })
    }

    label(value, x, y, z, width = 3, fontSize = 64)
    {
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 176
        const context = canvas.getContext('2d')
        const draw = text =>
        {
            context.fillStyle = '#fff0bf'
            context.fillRect(0, 0, canvas.width, canvas.height)
            context.fillStyle = '#382c38'
            context.font = `bold ${fontSize}px Nunito, sans-serif`
            context.textBaseline = 'middle'
            context.textAlign = 'center'
            context.fillText(text, canvas.width / 2, canvas.height / 2, 980)
        }
        draw(value)
        const map = new THREE.CanvasTexture(canvas)
        map.colorSpace = THREE.SRGBColorSpace
        const material = new MeshDefaultMaterial({
            colorNode: texture(map), side: THREE.DoubleSide, hasLightBounce: false
        })
        const mesh = this.mesh(new THREE.PlaneGeometry(width, width * 176 / 1024), material, x, y, z)
        return {
            mesh,
            setText(next) { draw(String(next)); map.needsUpdate = true },
            dispose() { map.dispose(); material.dispose() }
        }
    }

    build()
    {
        // Physical courtyard lets the original car drive even outside Bruno's authored terrain.
        this.box(0, -1.6, 0, 46, 3.2, 38, 'sand')
        this.collider([0, -1.6, 0], [23, 1.6, 19], 'floor')
        // Warm-earth road ring, unobstructed between the workstation and perimeter.
        for(const z of [-14, 14]) this.box(0, 0.04, z, 39, 0.08, 4, 'soil')
        for(const x of [-19, 19]) this.box(x, 0.04, 0, 4, 0.08, 27, 'soil')
        this.box(0, 0.11, 0, 28, 0.22, 21, 'grass')
        for(let x = -21; x <= 21; x += 3.5)
        {
            for(const z of [-18.1, 18.1])
            {
                this.box(x, 0.55, z, 0.13, 1.1, 0.13)
                this.box(x, 0.85, z, 3.5, 0.14, 0.12)
            }
        }
        // Decorative research gateway: not a collision trap for the spawn point.
        for(const x of [-5, 5]) this.box(x, 2.2, 12.4, 0.45, 4.4, 0.45, 'wood')
        this.box(0, 4.25, 12.4, 11, 1.1, 0.4, 'wood')
        this.label('CLOUD COMPUTE YARD', 0, 4.28, 12.65, 10.4, 60)
        this.label('8 TASKS   |   3 VIRTUAL MACHINES', 0, 3.32, 12.67, 7.6, 54)

        this.box(0, 0.32, 6, 27, 0.4, 5, 'wood')
        this.box(0, 0.55, 6, 26.6, 0.1, 4.6, 'sand')
        this.label('TASK QUEUE: INDEPENDENT JOBS', 0, 1.65, 8.7, 12.5, 60)

        for(let i = 0; i < 8; i++)
        {
            const x = -10.6 + i * 3.02
            const home = new THREE.Vector3(x, 1.18, 6)
            const size = 0.92 + this.problem.tasks[i].lengthMI / 6000
            const mesh = this.box(x, home.y, home.z, size, size, size, i % 2 ? 'amber' : 'plum')
            const sign = this.label(`T${i + 1} / ${this.problem.tasks[i].lengthMI} MI`, x, 2.04, 6.85, 2.65, 62)
            this.tasks.push({ mesh, home, sign, targetVM: null })
        }

        for(let vm = 0; vm < 3; vm++)
        {
            const x = [-9.6, 0, 9.6][vm]
            // Server module, podium and load indicator; all use Bruno-style faceted shapes.
            this.box(x, 0.32, -5.9, 6, 0.64, 6, 'wood', true)
            const pad = this.box(x, 0.69, -5.9, 5.5, 0.12, 5.4, ['amber', 'sea', 'moss'][vm])
            this.box(x, 1.6, -7.2, 2.5, 1.8, 1.2, 'cream')
            for(let s = 0; s < 3; s++) this.box(x - 0.72 + s * 0.72, 1.55, -6.52, 0.48, 0.48, 0.22, 'ink')
            this.box(x, 2.67, -7.2, 2.8, 0.34, 1.4, 'wood')
            this.label(`VM${vm + 1}  ${this.problem.vms[vm].mips} MIPS`, x, 3.08, -6.38, 5.3, 63)
            const loadLabel = this.label('LOAD 0.00 s', x, 1.2, -3.01, 5, 76)
            this.vms.push({ x, pad, loadLabel })
        }
        // Outdoor explanation point. The full M6 panel supplies academic formulas.
        this.box(15.7, 1.3, 6, 3.5, 2.6, 0.4, 'wood', true)
        this.label('E / ENTER', 15.7, 2.03, 6.24, 3.1, 78)
        this.label('LEARN SCHEDULING', 15.7, 1.41, 6.24, 3.1, 61)

        // Pedestrian schematic: task -> three candidate VMs.
        for(let vm = 0; vm < 3; vm++)
        {
            const x = this.vms[vm].x
            const branch = this.box(x / 2, 0.67, -1.04, 0.13, 0.06, 7.4, 'soil')
            branch.rotation.y = -Math.atan2(x / 2, 7.4)
        }
        // Small trees around the edges. Reuse GLB parts and palette via Bruno's Trees.
        const references = []
        for(const [x, z] of [[-21, -16], [-21, 3], [-20, 15], [21, -16], [21, 4], [20, 15]])
        {
            const instance = new THREE.Object3D()
            instance.position.copy(this.origin).add(new THREE.Vector3(x, 0, z))
            instance.scale.setScalar(0.65)
            instance.updateMatrixWorld()
            references.push(instance)
        }
        if(this.game.resources?.oakTreesVisualModel?.scene)
            this.trees = new Trees('Cloud yard trees', this.game.resources.oakTreesVisualModel.scene.clone(true), references, '#b4b536', '#d8cf3b')
        for(let i = 0; i < 130; i++)
        {
            const x = -17.5 + ((i * 7.37) % 35)
            const z = -11.5 + ((i * 3.83) % 23)
            if(Math.abs(x) < 14 && Math.abs(z) < 9) continue
            const sprout = this.mesh(new THREE.ConeGeometry(0.11, 0.35, 3), 'moss', x, 0.35, z)
            sprout.rotation.y = i * 0.47
        }
    }

    applyAllocation({ taskIndex, taskId, vmIndex, selectedVM, vmLoads, step, partialAssignment } = {})
    {
        const destination = Number.isInteger(vmIndex) ? vmIndex : selectedVM
        if(!Number.isInteger(taskIndex) || taskIndex < 0 || taskIndex >= 8 ||
            !Number.isInteger(destination) || destination < 0 || destination >= 3 ||
            !Array.isArray(vmLoads) || vmLoads.length !== 3 ||
            vmLoads.some(value => !Number.isFinite(value) || value < 0))
            throw new RangeError('Cloud allocation needs valid task, VM and three nonnegative VM loads')
        if(taskId !== undefined && taskId !== this.problem.tasks[taskIndex].id)
            throw new RangeError('Task ID and task index mismatch')
        if(partialAssignment !== undefined && (!Array.isArray(partialAssignment) ||
            partialAssignment.some(vm => !Number.isInteger(vm) || vm < 0 || vm >= 3)))
            throw new RangeError('Invalid partial assignment')
        const task = this.tasks[taskIndex]
        task.targetVM = destination
        const target = new THREE.Vector3(this.vms[destination].x, 1.15, -4.3 + (taskIndex % 3) * 0.72)
        this.motion = { task, from: task.mesh.position.clone(), to: target, t: 0 }
        this.vms.forEach((vm, index) =>
        {
            vm.pad.scale.y = index === destination ? 1.8 : 1
            vm.loadLabel.setText(`LOAD ${vmLoads[index].toFixed(2)} s`)
        })
        this.preview = false
        this.lastAllocation = { taskIndex, vmIndex: destination, vmLoads: [...vmLoads], step }
    }

    applySchedule({ assignments, vmLoads, makespan } = {})
    {
        if(!Array.isArray(assignments) || assignments.length !== 8 ||
            assignments.some(vm => !Number.isInteger(vm) || vm < 0 || vm >= 3) ||
            !Array.isArray(vmLoads) || vmLoads.length !== 3 ||
            vmLoads.some(value => !Number.isFinite(value) || value < 0) ||
            !Number.isFinite(makespan) || makespan <= 0)
            throw new RangeError('Invalid complete schedule')
        this.motion = null
        this.tasks.forEach((task, i) =>
        {
            const vm = assignments[i]
            task.targetVM = vm
            task.mesh.position.set(this.vms[vm].x - 1.15 + (i % 3) * 1.15, 1.2, -4.4 + Math.floor(i / 3) * 0.8)
        })
        this.vms.forEach((vm, i) => vm.loadLabel.setText(`LOAD ${vmLoads[i].toFixed(2)} s`))
        this.preview = false
        this.lastMakespan = makespan
    }

    update(delta)
    {
        if(!this.motion || !Number.isFinite(delta)) return
        this.motion.t = Math.min(1, this.motion.t + Math.max(0, delta) * 0.7)
        const { task, from, to, t } = this.motion
        const eased = t * t * (3 - 2 * t)
        task.mesh.position.lerpVectors(from, to, eased)
        task.mesh.position.y += Math.sin(Math.PI * t) * 0.6
        if(t >= 1) this.motion = null
    }

    resetVisualization()
    {
        this.motion = null
        for(const task of this.tasks)
        {
            task.mesh.position.copy(task.home)
            task.targetVM = null
        }
        this.vms.forEach(vm => { vm.pad.scale.y = 1; vm.loadLabel.setText('LOAD 0.00 s') })
        this.lastAllocation = null
        this.lastMakespan = null
        this.preview = true
    }

    setPreviewMode(enabled) { this.preview = Boolean(enabled) }
}
