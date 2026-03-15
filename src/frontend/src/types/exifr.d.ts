declare module "exifr" {
  interface ParseOptions {
    pick?: string[];
    [key: string]: unknown;
  }
  function parse(
    input: File | Blob | ArrayBuffer | string,
    options?: ParseOptions,
  ): Promise<Record<string, unknown> | null>;
  export default { parse };
}
