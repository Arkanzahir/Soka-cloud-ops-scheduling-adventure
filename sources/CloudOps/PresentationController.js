// Checkpoint navigation adapter; presentation UI/content belongs to M6.
export class PresentationController
{
    constructor(zoneManager, sections = ['main', 'test'])
    {
        this.zoneManager = zoneManager
        this.sections = sections
    }

    goTo(id)
    {
        if(!this.sections.includes(id) || id === this.zoneManager.currentZone)
            return Promise.resolve(false)
        return this.zoneManager.enter(id, true)
    }

    next()
    {
        return this.goTo(this.sections[this.sections.indexOf(this.zoneManager.currentZone) + 1])
    }

    previous()
    {
        return this.goTo(this.sections[this.sections.indexOf(this.zoneManager.currentZone) - 1])
    }
}
