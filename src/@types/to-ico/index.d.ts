declare module 'to-ico' {
  type Input = Buffer | ArrayBuffer | string | Buffer[] | string[];
  
  interface ToIcoOptions {
    sizes?: Array<[number, number]>;
    resize?: boolean;
  }
  
  function toIco(
    input: Input,
    options?: ToIcoOptions
  ): Promise<Buffer>;

  export = toIco;
}
