import { ElementNode } from '../basicdom';

export default class TemplateElement extends ElementNode {
    constructor() {
        super('template');
    }

    set component(value: typeof ElmComponent) {
        this.setAttribute('component', value)
    }

    get component(): typeof ElmComponent {
        return this.getAttribute('component')
    }
}
