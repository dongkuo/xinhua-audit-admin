export function calculateAge(birthday) {
  if (!birthday) {
    return '-'
  }
  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) {
    return '-';
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }
  return age < 0 ? '-' : age;
}
