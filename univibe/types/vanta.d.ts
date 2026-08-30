declare module 'vanta/dist/vanta.net.min' {
  import * as THREE from 'three';

  interface VantaNetOptions {
    el: HTMLElement;
    THREE?: typeof THREE;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    backgroundColor?: number | string;
    color?: number | string;
    points?: number;
    maxDistance?: number;
    spacing?: number;
    showDots?: boolean;
  }

  export interface VantaEffect {
    destroy(): void;
  }

  function NET(options: VantaNetOptions): VantaEffect;

  export default NET;
}
