export interface IBank {
  name: string;
}

export interface IBankCreate extends IBank {
  name: string;
}

export interface IBankResponse extends IBank {
  id: number;
}
