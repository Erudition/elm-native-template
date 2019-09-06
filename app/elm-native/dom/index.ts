//import { registerElmElements } from './elm-elements'
import { registerNativeElements } from './nativescript-elements'
import ElmNativeDocument from './elm/ElmNativeDocument'
import NativeElementNode from './native/NativeElementNode'
import { write, messageType } from 'tns-core-modules/trace'
import { logger, LogLevel } from './basicdom'

export { default as FrameElement } from "./native/FrameElement"
export { default as ElmNativeDocument } from './elm/ElmNativeDocument'
export { default as NativeElementNode } from './native/NativeElementNode'
export { registerElement, createElement, ViewNode } from './basicdom'
export { navigate, goBack, showModal, closeModal, ShowModalOptions, NavigationOptions, BackNavigationOptions } from './navigation'


function installGlobalShims(): ElmNativeDocument {

    //expose our fake dom as global document for elm components
    let window = global as any;

    window.window = global;
    window.document = new ElmNativeDocument();

    window.requestAnimationFrame = (action: () => {}) => {
        setTimeout(action, 33); //about 30 fps
    }

    window.getComputedStyle = (node: NativeElementNode) => {
        return node.nativeView.style;
    }

    window.performance = {
        now() {
            return Date.now();
        }
    };

    window.CustomEvent = class {
        detail: any;
        eventName: string;
        type: string;
        constructor(name: string, detail: any = null) {
            this.eventName = name; //event name for nativescript
            this.type = name; // type for elm
            this.detail = detail;
        }
    }

    return window.document;
}

export const DomTraceCategory = 'ElmNativeDom'

function initializeLogger() {
    logger.setHandler((message, level) => {
        let traceLevel = messageType.log
        switch (level) {
            case LogLevel.Debug: traceLevel = messageType.log; break;
            case LogLevel.Info: traceLevel = messageType.info; break;
            case LogLevel.Warn: traceLevel = messageType.warn; break;
            case LogLevel.Error: traceLevel = messageType.error; break;
        }
        write(message, DomTraceCategory, traceLevel)
    })
}

export function initializeDom() {
    initializeLogger();
    //registerElmElements();
    registerNativeElements();
    return installGlobalShims();
}
