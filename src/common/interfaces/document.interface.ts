import { UpdateResult } from 'typeorm';
import { IEmployee } from 'cts-entities';

export interface IDocument {
  url_file: string;
  size?: number;
  name: string;
  type: ITypeDocument;
  employee: IEmployee;
}

export interface ITypeDocument {
  type: string;
}

export interface ICreateDocument extends Omit<IDocument, 'employee' | 'type'> {
  type: number;
  employee: number;
}

export interface ISendDocument {
  employee: number;
  data: IFileSend[];
}

export interface IUpdateSendDocument {
  id: number;
  data: IFileSend;
}

export interface IFileSend {
  type: number;
  file: string;
}

export interface IResponseUpdateDocument {
  result: UpdateResult;
  old_file: string;
}
