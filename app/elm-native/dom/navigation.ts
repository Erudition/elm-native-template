import { topmost, NavigationTransition, Frame, getFrameById, Page, BackstackEntry, ViewBase, NavigatedData } from "tns-core-modules/ui/frame";
import FrameElement from "./native/FrameElement";
import { createElement, logger as log } from "./basicdom";
import PageElement from "./native/PageElement";
import NativeElementNode from "./native/NativeElementNode";

export type FrameSpec = Frame | FrameElement | string
export type PageSpec = typeof ElmComponent;
export interface NavigationOptions {
    page: PageSpec;
    props?: any;
    frame?: FrameSpec;

    animated?: boolean;
    backstackVisible?: boolean;
    clearHistory?: boolean;
    transition?: NavigationTransition;
    transitionAndroid?: NavigationTransition;
    transitioniOS?: NavigationTransition;
}

function resolveFrame(frameSpec: FrameSpec): Frame {
    let targetFrame: Frame;
    if (!frameSpec) targetFrame = topmost();
    if (frameSpec instanceof FrameElement) targetFrame = frameSpec.nativeView as Frame;
    if (frameSpec instanceof Frame) targetFrame = frameSpec;
    if (typeof frameSpec == "string") {
        targetFrame = getFrameById(frameSpec)
        if (!targetFrame) log.error(`Navigate could not find frame with id ${frameSpec}`)
    }
    return targetFrame;
}

interface ComponentInstanceInfo { element: NativeElementNode, pageInstance: ElmComponent }

function resolveComponentElement(pageSpec: PageSpec, props?: any): ComponentInstanceInfo {
    let dummy = createElement('fragment');
    let pageInstance = new pageSpec({ target: dummy, props: props });
    let element = dummy.firstElement() as NativeElementNode;
    return { element, pageInstance }
}

export function navigate(options: NavigationOptions): ElmComponent {
    let { frame, page, props = {}, ...navOptions } = options;

    let targetFrame = resolveFrame(frame);

    if (!targetFrame) {
        throw new Error("navigate requires frame option to be a native Frame, a FrameElement, a frame Id, or null")
    }
    if (!page) {
        throw new Error("navigate requires page to be set to the elm component class that implements the page or reference to a page element")
    }

    let { element, pageInstance } = resolveComponentElement(page, props);

    if (!(element instanceof PageElement))
        throw new Error("navigate requires a elm component with a page element at the root")

    let nativePage = element.nativeView;

    const handler = (args: NavigatedData) => {
        if (args.isBackNavigation) {
            nativePage.off('navigatedFrom', handler)
            pageInstance.$destroy()
        }
    }
    nativePage.on('navigatedFrom', handler)

    targetFrame.navigate({
        ...navOptions,
        create: () => nativePage
    });

    return pageInstance;
}

export interface BackNavigationOptions {
    frame?: FrameSpec;
    to?: PageElement;
}

export function goBack(options: BackNavigationOptions = {}) {
    let targetFrame = resolveFrame(options.frame);
    if (!targetFrame) {
        throw new Error("goback requires frame option to be a native Frame, a FrameElement, a frame Id, or null")
    }
    let backStackEntry: BackstackEntry = null;
    if (options.to) {
        backStackEntry = targetFrame.backStack.find(e => e.resolvedPage === options.to.nativeView);
        if (!backStackEntry) {
            throw new Error("Couldn't find the destination page in the frames backstack")
        }
    }
    return targetFrame.goBack(backStackEntry);
}

export interface ShowModalOptions {
    page: PageSpec
    props?: any
    android?: { cancelable: boolean }
    ios?: { presentationStyle: any }
    animated?: boolean
    fullscreen?: boolean
    stretched: boolean
}

const modalStack: ComponentInstanceInfo[] = []

export function showModal<T>(modalOptions: ShowModalOptions): Promise<T> {
    let { page, props = {}, ...options } = modalOptions;

    //Get this before any potential new frames are created by component below
    let modalLauncher = topmost().currentPage;

    let componentInstanceInfo = resolveComponentElement(page, props);
    let modalView: ViewBase = componentInstanceInfo.element.nativeView;

    return new Promise((resolve, reject) => {

        let resolved = false;
        const closeCallback = (result: T) => {
            if (resolved) return;
            resolved = true;
            try {
                componentInstanceInfo.pageInstance.$destroy(); //don't let an exception in destroy kill the promise callback
            } finally {
                resolve(result);
            }
        }
        modalStack.push(componentInstanceInfo);
        modalLauncher.showModal(modalView, { ...options, context: {}, closeCallback })
    });
}

export function closeModal(result: any): void {
    let modalPageInstanceInfo = modalStack.pop();
    modalPageInstanceInfo.element.nativeView.closeModal(result);
}
