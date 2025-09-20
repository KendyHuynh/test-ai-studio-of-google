export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

export interface GeneratedResult {
  image: string | null;
  text: string | null;
}
