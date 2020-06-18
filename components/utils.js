export const checkSource = (uri) => {
  return typeof uri === 'string' ?
    { source: { uri } } : { source: uri }
}



const SCOPE = Math.pow(10,6);
const SMALL_SCOPE = Math.pow(10,4);

export const divide = (a, b) => {
  const bigA = Math.round(a * SCOPE);
  const bigB = Math.round(b * SCOPE);
  return (bigA / bigB);
}

export const multiply = (a, b) => {
  const bigA = Math.round(a * SCOPE);
  const bigB = Math.round(b * SCOPE);
  const temp = bigA * bigB;
  if( Number.isSafeInteger(temp)) {
    return temp / SCOPE / SCOPE;
  } else {
    const smallA = Math.round(a * SMALL_SCOPE);
    const smallB = Math.round(b * SMALL_SCOPE);
    return (smallA * smallB) / SMALL_SCOPE / SMALL_SCOPE;
  }
}
