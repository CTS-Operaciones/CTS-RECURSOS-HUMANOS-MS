export const msgError = (
  errorCode: keyof typeof ErrorCode,
  value: any = null,
) => {
  const codeMacher = {
    MSG: value ? value : 'Error no definido',
    // Posibles codigos de error
    // Generales
    NOT_FOUND: 'No se encontraron registros',

    NO_VALUE: `No se obtuvo el valor de ${value}`,

    NO_GET_PARAM: `No se obtuvo el parametro requerido`,

    FORMAT_INCORRECT: `Formato incorrecto para ${value} - ${typeof value}`,

    // Errores de autenticación
    UNAUTHORIZED_NOT_FOUND: 'El usuario no existe',

    UNAUTHORIZED: 'Usuario inactivo',

    UNAUTHORIZED_CREDENTIALS: 'Las credenciales son incorrectas',

    UNAUTHORIZED_EMAIL: `El nombre del usuario es incorrecto`,

    UNAUTHORIZED_PASSWORD: `La contraseña es incorrecta`,

    UNAUTHORIZED_TOKEN: `Token no valido`,

    // Errores de validaciones
    REGISTER_EXIST: `Ya existe un registro con los datos ingresados`,

    NO_WITH_TERM: `No se encontro ninguna coincidencia para la busqueda "${value}"`,

    UPDATE_NOT_FOUND: `Registro con id "${value}" no encontrado para actualizarse`,

    DELETE_NOT_FOUND: `Registro con id ${value} no encontrado para eliminarse`,

    REGISTER_NOT_DELETE_ALLOWED: `No se puede eliminar el registro con id ${value} porque tiene relaciones asignadas`,

    LENGTH_INCORRECT: `La longitud de ${value?.ids} con ${value?.find} es incorrecta`,

    DATE_RANGE_INCORRECT: `las fechas ingresadas son incorrectas`,

    // Validación de employees in headquarter
    MAX_EMPLOYEES: 'La sede alcanzo el maximo de empleados requeridos',

    EXIST_MAX_EMPLOYEES: `Esta a ${value?.N} de alcanzar el maximo de empleados (${value?.M}) en la sede`,

    NO_EXIST_POSITION: `No existe la posicion ${value} en la sede`,

    PARENT_REQUIRED: `El campo parent es requerido`,

    NOT_REQUIRED_BOSS: `No requiere un jefe directo`,

    PARENT_NOT_VALID: `El campo parent no es valido para el registro (se encontraron: ${value})`,

    // Activar y desactivar
    ACTIVATE: 'No se logro activar el registro',

    DEACTIVATE: 'No se logro desactivar el registro',
  };

  return codeMacher[errorCode];
};

export declare enum ErrorCode {
  MSG = 'MSG',
  NOT_FOUND = 'NOT_FOUND',
  NO_VALUE = 'NO_VALUE',
  NO_GET_PARAM = 'NO_GET_PARAM',
  FORMAT_INCORRECT = 'FORMAT_INCORRECT',
  UNAUTHORIZED_NOT_FOUND = 'UNAUTHORIZED_NOT_FOUND',
  UNAUTHORIZED_CREDENTIALS = 'UNAUTHORIZED_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNAUTHORIZED_EMAIL = 'UNAUTHORIZED_EMAIL',
  UNAUTHORIZED_PASSWORD = 'UNAUTHORIZED_PASSWORD',
  UNAUTHORIZED_TOKEN = 'UNAUTHORIZED_TOKEN',
  REGISTER_EXIST = 'REGISTER_EXIST',
  NO_WITH_TERM = 'NO_WITH_TERM',
  LENGTH_INCORRECT = 'LENGTH_INCORRECT',
  DATE_RANGE_INCORRECT = 'DATE_RANGE_INCORRECT',
  UPDATE_NOT_FOUND = 'UPDATE_NOT_FOUND',
  DELETE_NOT_FOUND = 'DELETE_NOT_FOUND',
  REGISTER_NOT_DELETE_ALLOWED = 'REGISTER_NOT_DELETE_ALLOWED',
  MAX_EMPLOYEES = 'MAX_EMPLOYEES',
  EXIST_MAX_EMPLOYEES = 'EXIST_MAX_EMPLOYEES',
  NO_EXIST_POSITION = 'NO_EXIST_POSITION',
  PARENT_REQUIRED = 'PARENT_REQUIRED',
  NOT_REQUIRED_BOSS = 'NOT_REQUIRED_BOSS',
  PARENT_NOT_VALID = 'PARENT_NOT_VALID',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
}
