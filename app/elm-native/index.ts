import { run, on, launchEvent } from 'tns-core-modules/application'
import { navigate, ViewNode, createElement, initializeDom, FrameElement } from './dom';


declare global {
    export class ElmComponent {
        $destroy(): void;
        constructor(options: { target?: ViewNode, props?: any, anchor?: ViewNode, intro?: boolean });
        $set(props: any): void;
    }
}

export function elmNative(startPage: typeof ElmComponent, data: any): Promise<ElmComponent> {
    initializeDom();
    console.warn("HEY I'M IN elmNative and doc is " + window.document);
    //setup a frame so we always have somewhere to hang our css
    let rootFrame = createElement('frame') as FrameElement;
    rootFrame.setAttribute("id", "app-root-frame");


    var runningElmApp = require("../compiled-elm.js").Elm.Main.init({
      node: rootFrame
    });
    let pageInstance = navigate({
        page: rootFrame, //was startPage
        props: data || {},
        frame: rootFrame
    })


    return new Promise((resolve, reject) => {
        //wait for launch
        on(launchEvent, () => {
            console.log("Application Launched");
            resolve(pageInstance);
        })

        try {
            run({ create: () => rootFrame.nativeView });
        } catch (e) {
            reject(e);
        }
    });
}

export { navigate, goBack, showModal, closeModal, initializeDom, DomTraceCategory } from "./dom"
