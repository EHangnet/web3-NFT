export interface WordSeed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

export interface EncodedImage {
  filename: string;
  data: string;
}

export interface WordData {
  parts: EncodedImage[];
  background: string;
}
