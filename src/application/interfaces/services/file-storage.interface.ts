export interface IFileStorageService {
  save(params: {
    buffer: Buffer;
    mimeType: string;
    path: string;
  }): Promise<string>;
}


