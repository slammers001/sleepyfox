declare module 'icojs' {
  export function generate(images: HTMLCanvasElement[]): Promise<Blob>;
  export function isICO(source: any): boolean;
  export function parseICO(buffer: any, mime?: string): Promise<any[]>;
}
