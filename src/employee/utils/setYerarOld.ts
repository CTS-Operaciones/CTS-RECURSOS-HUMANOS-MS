import { ErrorManager, msgError } from '../../../common/utils';

export const setYearOld = (date: string) => {
  const date_birth = new Date(date);

  if (isNaN(date_birth.getTime())) {
    throw new ErrorManager({
      type: 'NOT_ACCEPTABLE',
      message: msgError('FORMAT_INCORRECT', date),
    });
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  const birthMonth = date_birth.getMonth();
  const birthDay = date_birth.getDate();

  let age = currentYear - date_birth.getFullYear();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age -= 1;
  }

  return age;
};
