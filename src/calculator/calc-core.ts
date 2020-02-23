import { create, all, MathJsStatic } from 'mathjs';

export interface CalcProps {
  calc: string;
  history: string;
  newInput: string;
  setCalc: Function;
  setHistory: Function;
  setValidity: Function;
}

const mathJs = create(all, { number: 'BigNumber' }) as MathJsStatic;
const operations = ['-', '+', 'x', '/'];

const resetCalc = (calcProps: CalcProps): void => {
  const { setCalc, setHistory } = calcProps;
  setCalc('');
  setHistory('');
};

const deleteFromCalc = (calcProps: CalcProps): void => {
  const { calc, setCalc } = calcProps;
  setCalc(calc.slice(0, -1));
};

const replaceMultiply = (calc: string): string => {
  return calc.replace(/x/g, '*');
};

const prefixZeroCheck = (calcProps: CalcProps): boolean => {
  const { calc, newInput } = calcProps;
  if (newInput !== '.') { return false }
  return !calc || operations.includes(calc.substr(-1));
};

const replaceOperatorCheck = (calcProps: CalcProps): boolean => {
  const { calc, newInput } = calcProps;
  if (!operations.includes(newInput) || newInput === '-') { return false }
  const lastInput = calc.substr(-1);
  return [...operations, '.'].includes(lastInput);
};

const addToCalc = (calcProps: CalcProps): void => {
  const { calc, setCalc, newInput } = calcProps;
  const newInputDecimalChecked = calcCore.prefixZeroCheck(calcProps) ? '0' + newInput : newInput;
  const calcLastOperatorChecked = calcCore.replaceOperatorCheck(calcProps) ? calc.slice(0, -1)  : calc;
  setCalc(calcLastOperatorChecked + newInputDecimalChecked);
};

const toExponentialCheckApply = (result: number): string => {
  if (result.toString().length > 10) {
    return result.toExponential(6).toString();
  } else {
    return result.toString();
  }
};

const applyCalcResult = (result: number, calcProps: CalcProps): void => {
  const { calc, setCalc, setHistory } = calcProps;
  setCalc(calcCore.toExponentialCheckApply(result));
  setHistory(calc + ' =');
};

const calculateSum = (forReal: boolean, calcProps: CalcProps, calc?: string): boolean => {
  const calculation = calc || calcProps.calc;
  const finalCalc = calcCore.replaceMultiply(calculation);
  let result;

  try {
    result = calcCore.mathJs.evaluate(finalCalc);
  } catch {
    return false;
  }

  if (result === undefined) {
    return false;
  }

  if (forReal) {
    calcCore.applyCalcResult(result, calcProps);
  }

  return true; // If we got here, the calculation was valid to returning a result :)
};

const invalidFlash = (calcProps: CalcProps): void => {
  const { setValidity } = calcProps;
  setValidity('invalid');
  setTimeout(() => {
    setValidity('valid');
  }, 300);
};

const validCalculation = (calcProps: CalcProps): boolean => {
  const { calc, newInput } = calcProps;
  const lastInput = calc.substr(-1);
  if (operations.includes(newInput) && lastInput === newInput) { return false; }
  const lastOperatorChecked = calcCore.replaceOperatorCheck(calcProps) ? calc.slice(0, -1)  : calc;
  return calcCore.calculateSum(false, calcProps, lastOperatorChecked + newInput + '0');
};

const handleInput = (calcProps: CalcProps): boolean | void => {
  const { newInput } = calcProps;
  if (newInput === 'Clear') { return calcCore.resetCalc(calcProps); } // prettier-ignore
  if (newInput === 'Del'  ) { return calcCore.deleteFromCalc(calcProps); } // prettier-ignore

  if (newInput === '=') {
    return calcCore.calculateSum(true, calcProps) || calcCore.invalidFlash(calcProps);
  }

  calcCore.validCalculation(calcProps) ? calcCore.addToCalc(calcProps) : calcCore.invalidFlash(calcProps);
};

export const calcCore = {
  resetCalc,
  deleteFromCalc,
  replaceMultiply,
  prefixZeroCheck,
  replaceOperatorCheck,
  addToCalc,
  toExponentialCheckApply,
  applyCalcResult,
  calculateSum,
  invalidFlash,
  validCalculation,
  handleInput,
  mathJs
};

// Why self reference via calcCore between functions?
// Approach for Mock/Spy exported functions within a single module in Jest
// https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
