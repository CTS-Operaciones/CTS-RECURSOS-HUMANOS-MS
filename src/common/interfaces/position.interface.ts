export interface IPosition {
  name: string;
  salary: number;
  salary_in_words: string;
}

export interface ICreatePosition extends IPosition {
  department_id: number;
}
