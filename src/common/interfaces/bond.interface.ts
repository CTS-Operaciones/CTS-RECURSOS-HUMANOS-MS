export interface IDescriptionBond {
  description: string;
}

export interface ITypesBond {
  type: string;
}

export interface IBond {
  amount: number;
  description_id: IDescriptionBond;
  type_id: ITypesBond;
}

export interface IBondCreate {
  amount: number;
  description_id: number;
  type_id: number;
  employee_id: number;
  date_assigned: Date;
  date_limit: Date;
}

export interface IAssignBondToEmployee {
  employee_id: number;
  date_assigned: string;
  date_limit: string;
  date_registration: string;
}

export interface ITypesBond {
  type: string;
}

export interface IDescriptionBond {
  description: string;
}
