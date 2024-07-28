export function validateEmail(email): boolean {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
