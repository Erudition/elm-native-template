import { registerElement, ElementNode } from "./basicdom";
import HeadElement from "./elm/HeadElement";
import StyleElement from "./elm/StyleElement";
import TemplateElement from "./elm/TemplateElement";

// Dom elements that elm expect to be able to create or use.
// or custom additions to make life easier

export function registerSvelteElements() {
    registerElement('head', () => new HeadElement());
    registerElement('style', () => new StyleElement());
    registerElement('fragment', () => new ElementNode('fragment'));
    registerElement('template', () => new TemplateElement());
}
