import { calcCore, CalcProps } from './calc-core';

jest.useFakeTimers();

// Seems to be something odd with Jest not clearing spy mock implementations
// Going to be defensive now since finding the issue in my latter tests
// https://github.com/facebook/jest/issues/7136
interface Spies {
  [index: string]: jest.SpyInstance;
}

function spiesMockRestore(spies: Spies): void {
  for (const spy of Object.keys(spies)) {
    spies[spy].mockRestore();
  }
}

describe('Calc Helper', () => {
  const mockHookFuncs = {
    setCalc: jest.fn(),
    setHistory: jest.fn(),
    setValidity: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`resetCalc - Should clear the calc and history values to an empty string`, () => {
    const calcProps = (mockHookFuncs as unknown) as CalcProps;
    calcCore.resetCalc(calcProps);
    expect(mockHookFuncs.setCalc).toHaveBeenCalledWith('');
    expect(mockHookFuncs.setHistory).toHaveBeenCalledWith('');
  });

  it(`deleteFromCalc - Should slice the last character from the calc string and set this as the new calc`, () => {
    const calcProps = ({ calc: '1+2x33', ...mockHookFuncs } as unknown) as CalcProps;
    calcCore.deleteFromCalc(calcProps);
    expect(mockHookFuncs.setCalc).toHaveBeenCalledWith('1+2x3');
  });

  it(`setHistoryAnswerCheckApply - Should check and apply the last answer to history if a new calc has started`, () => {
    // prettier-ignore
    let calcProps = ({ calc: '14', history: '7 + 7', ...mockHookFuncs } as unknown) as CalcProps;
    calcCore.setHistoryAnswerCheckApply(calcProps);
    expect(mockHookFuncs.setHistory).toHaveBeenCalledWith('Ans = 14');

    jest.clearAllMocks();
    calcProps = ({ calc: '14', history: 'Ans = 14', ...mockHookFuncs } as unknown) as CalcProps;
    calcCore.setHistoryAnswerCheckApply(calcProps);
    expect(mockHookFuncs.setHistory).not.toHaveBeenCalled();
  });

  describe(`replaceMultiply - Should return the calc string with all 'x' characters changed to '*'`, () => {
    // prettier-ignore
    const cases = [
      [ '1-2+3x4/5',    '1-2+3*4/5'    ],
      [ '1-2x3-4/5.6',  '1-2*3-4/5.6'  ],
      [ '1x2+3+4/5.6x', '1*2+3+4/5.6*' ],
      [ '1x2x3x4/5',    '1*2*3*4/5'    ],
      [ '1x2x3x4/5.6',  '1*2*3*4/5.6'  ],
      [ '1x2x3x4/5.6x', '1*2*3*4/5.6*' ]
    ];

    test.each(cases)('replaceMultiply(%s) returns %s', (calc, expected) => {
      expect(calcCore.replaceMultiply(calc)).toBe(expected);
    });
  });

  describe(`padOperations - Should return the calc string with spaces around operators`, () => {
    // prettier-ignore
    const cases = [
      [ '1-2+3x4/5',       '1 - 2 + 3 x 4 / 5'          ],
      [ '1-2+3x4/5.6',     '1 - 2 + 3 x 4 / 5.6'        ],
      [ '1-2+3x4/5.6+0',   '1 - 2 + 3 x 4 / 5.6 + 0'    ],
      [ '1-2+3x4/5+',      '1 - 2 + 3 x 4 / 5 + '       ],
      [ '1-2+3x4/5.6-',    '1 - 2 + 3 x 4 / 5.6 - '     ],
      [ '1-2+3x4/5.6+0x',  '1 - 2 + 3 x 4 / 5.6 + 0 x ' ],
      [ '1x-2+3x4/5',      '1 x -2 + 3 x 4 / 5'         ],
      [ '1-2+3x-4/5.6',    '1 - 2 + 3 x -4 / 5.6'       ],
      [ '1x-2+3x-4/5.6+0', '1 x -2 + 3 x -4 / 5.6 + 0'  ],
      [ '-10',             '-10'                        ],
      [ '-10x-3',          '-10 x -3'                   ],
      [ '-10/-3',          '-10 / -3'                   ],
      [ '1.000000e+16',    '1.000000e+16'               ]
    ];

    test.each(cases)('padOperations(%s) returns %s', (calc, expected) => {
      expect(calcCore.padOperations(calc)).toBe(expected);
    });
  });

  describe(`getLastFullNumber - Should return the last full number in an string`, () => {
    // prettier-ignore
    const cases = [
      [ '1x2+3-4/5.6', '5.6' ],
      [ '6-5/4x3+2.1', '2.1' ],
      [ '9.1',         '9.1' ],
      [ '0',           '0'   ],
      [ '5.1x',        ''    ]
    ];

    test.each(cases)('getLastFullNumber(%s) returns %s', (calc, expected) => {
      expect(calcCore.getLastFullNumber(calc)).toBe(expected);
    });
  });

  describe(`replaceZeroCheck - Should return true or false if it is appropriate to replace the last '0'`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ {calc: '1x2+3-4/0',   newInput: '1'}, true  ],
      [ {calc: '1x2+3-4/0',   newInput: '.'}, false ],
      [ {calc: '1x2+3-4/0',   newInput: '+'}, false ],
      [ {calc: '6-5/4x3+0.1', newInput: '2'}, false ],
      [ {calc: '6-5/4x3+10',  newInput: '3'}, false ],
      [ {calc: '6-5/4x0',     newInput: '4'}, true  ],
      [ {calc: '6-5/4x0',     newInput: '.'}, false ],
      [ {calc: '0',           newInput: '5'}, true  ],
      [ {calc: '0',           newInput: '-'}, false ],
      [ {calc: '0',           newInput: '0'}, true  ],
      [ {calc: '0',           newInput: '1'}, true  ],
      [ {calc: '',            newInput: '0'}, false ]
    ];

    test.each(cases)('replaceZeroCheck(%s) returns %s', (calcProps: CalcProps, expected: boolean) => {
      expect(calcCore.replaceZeroCheck(calcProps)).toBe(expected);
    });
  });

  describe(`replaceOperatorCheck - Should return true or false if it is appropriate to replace the operation or decimal`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ {calc: '5x2+3x', newInput: '-'}, false ],
      [ {calc: '5x2+3-', newInput: '+'}, true  ],
      [ {calc: '5x2+3+', newInput: '/'}, true  ],
      [ {calc: '5x2+3/', newInput: '-'}, false ],
      [ {calc: '5x2+3.', newInput: '+'}, true  ],
      [ {calc: '5x2+31', newInput: '+'}, false ],
      [ {calc: '5x2+32', newInput: '-'}, false ],
      [ {calc: '5x2+33', newInput: '+'}, false ],
      [ {calc: '5x2+34', newInput: '/'}, false ],
      [ {calc: '5x2+35', newInput: '-'}, false ],
      [ {calc: '5x2+30', newInput: '+'}, false ]
    ];

    test.each(cases)('replaceOperatorCheck(%s) returns %s', (calcProps: CalcProps, expected: boolean) => {
      expect(calcCore.replaceOperatorCheck(calcProps)).toBe(expected);
    });
  });

  describe(`sliceLastInputCheck - Should call and return a boolean from replaceZeroCheck || replaceOperatorCheck`, () => {
    it(`sliceLastInputCheck - Should call replaceOperatorCheck only with calcProps if it returns true`, () => {
      // prettier-ignore
      const spies = {
        replaceOperatorCheck: jest.spyOn(calcCore, 'replaceOperatorCheck').mockImplementation(() => true),
        replaceZeroCheck:     jest.spyOn(calcCore, 'replaceZeroCheck')
      };
      const calcProps = { calc: 'mock-calc' } as CalcProps;
      calcCore.sliceLastInputCheck(calcProps);
      expect(spies.replaceOperatorCheck).toHaveBeenCalledWith(calcProps);
      expect(spies.replaceZeroCheck).not.toHaveBeenCalled();
      spiesMockRestore(spies);
    });

    it(`sliceLastInputCheck - Should call replaceZeroCheck if calling replaceOperatorCheck returns false`, () => {
      // prettier-ignore
      const spies = {
        replaceOperatorCheck: jest.spyOn(calcCore, 'replaceOperatorCheck').mockImplementation(() => false),
        replaceZeroCheck:     jest.spyOn(calcCore, 'replaceZeroCheck')
      };
      const calcProps = { calc: 'mock-calc' } as CalcProps;
      calcCore.sliceLastInputCheck(calcProps);
      expect(spies.replaceOperatorCheck).toHaveBeenCalledWith(calcProps);
      expect(spies.replaceZeroCheck).toHaveBeenCalledWith(calcProps);
      spiesMockRestore(spies);
    });

    it(`sliceLastInputCheck - Should return a boolean from evaluating replaceZeroCheck and replaceOperatorCheck`, () => {
      const calcProps = { calc: 'not-really-relevant' } as CalcProps;

      // true || false
      // prettier-ignore
      let spies = {
        replaceOperatorCheck: jest.spyOn(calcCore, 'replaceOperatorCheck').mockImplementation(() => false),
        replaceZeroCheck:     jest.spyOn(calcCore, 'replaceZeroCheck').mockImplementation(() => true)
      };
      let result = calcCore.sliceLastInputCheck(calcProps);
      expect(result).toBe(true);
      spiesMockRestore(spies);

      // false || true
      // prettier-ignore
      spies = {
        replaceOperatorCheck: jest.spyOn(calcCore, 'replaceOperatorCheck').mockImplementation(() => true),
        replaceZeroCheck:     jest.spyOn(calcCore, 'replaceZeroCheck').mockImplementation(() => false)
      };
      result = calcCore.sliceLastInputCheck(calcProps);
      expect(result).toBe(true);
      spiesMockRestore(spies);

      // false || false
      // prettier-ignore
      spies = {
        replaceOperatorCheck: jest.spyOn(calcCore, 'replaceOperatorCheck').mockImplementation(() => false),
        replaceZeroCheck:     jest.spyOn(calcCore, 'replaceZeroCheck').mockImplementation(() => false)
      };
      result = calcCore.sliceLastInputCheck(calcProps);
      expect(result).toBe(false);
      spiesMockRestore(spies);
    });
  });

  describe(`prefixZeroCheck - Should return a boolean when evaluating if zero prefix is appropriate`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ {calc: '1+2x3-', newInput: '.'}, true  ],
      [ {calc: '1+2x3+', newInput: '.'}, true  ],
      [ {calc: '1+2x3x', newInput: '.'}, true  ],
      [ {calc: '1+2x3/', newInput: '.'}, true  ],
      [ {calc: '1+2x30', newInput: '.'}, false ],
      [ {calc: '1+2x31', newInput: '.'}, false ],
      [ {calc: '1+2x3-', newInput: '1'}, false ],
      [ {calc: '1+2x3+', newInput: '2'}, false ],
      [ {calc: '1+2x3x', newInput: '3'}, false ],
      [ {calc: '1+2x3/', newInput: '4'}, false ]
    ];

    test.each(cases)('prefixDecimalZeroCheck(%s) returns %s', (calcProps: CalcProps, expected: boolean) => {
      expect(calcCore.prefixZeroCheck(calcProps)).toBe(expected);
    });
  });

  describe(`addToCalc - Should set the calc display, amending the values if necessary, and then call setHistoryAnswerCheckApply`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ {calc: '1+2x3x',  newInput: '/', history: ''}, '1+2x3/', ],
      [ {calc: '1+2x3/',  newInput: 'x', history: ''}, '1+2x3x', ],
      [ {calc: '1+2x3.',  newInput: '+', history: ''}, '1+2x3+', ],
      [ {calc: '1+2x0',   newInput: '0', history: ''}, '1+2x0',  ],
      [ {calc: '1+2x0',   newInput: '1', history: ''}, '1+2x1',  ],
      [ {calc: '1+2x',    newInput: '.', history: ''}, '1+2x0.', ]
    ];


    test.each(cases)('validCalculation(%s) returns %b', (calcProps: CalcProps, calledWith: string) => {
      // prettier-ignore
      const spies = {
        prefixZeroCheck:            jest.spyOn(calcCore, 'prefixZeroCheck'),
        sliceLastInputCheck:        jest.spyOn(calcCore, 'sliceLastInputCheck'),
        setHistoryAnswerCheckApply: jest.spyOn(calcCore, 'setHistoryAnswerCheckApply')
      };
      const calcPropsAndHooks = {...calcProps, ...mockHookFuncs};
      calcCore.addToCalc(calcPropsAndHooks);
      expect(spies.prefixZeroCheck).toHaveBeenCalledWith(calcPropsAndHooks);
      expect(spies.sliceLastInputCheck).toHaveBeenCalledWith(calcPropsAndHooks);
      expect(mockHookFuncs.setCalc).toHaveBeenCalledWith(calledWith);
      expect(spies.setHistoryAnswerCheckApply).toHaveBeenCalledWith(calcPropsAndHooks);
      spiesMockRestore(spies);
    });
  });

  describe(`toExponentialCheckApply - Should return the value string, or exponential value string depending on value string length as greater than 10`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ 1,             '1'            ],
      [ 12,            '12'           ],
      [ 123,           '123'          ],
      [ 123456,        '123456'       ],
      [ 1234567890,    '1234567890'   ],
      [ 12345678910,   '1.234568e+10' ],
      [ 1234567891011, '1.234568e+12' ],
    ];

    test.each(cases)('toExponentialCheckApply(%s) returns %s', (result: number, expected: string) => {
      expect(calcCore.toExponentialCheckApply(result)).toBe(expected);
    });
  });

  it(`applyCalcResult - Should set the given result the calc display after running it through the toExponentialCheckApply, and then set history , `, () => {
    let result = 14;
    let calcProps = {calc: '7+7', ...mockHookFuncs} as unknown as CalcProps;
    calcCore.applyCalcResult(result, calcProps);
    expect(mockHookFuncs.setCalc).toHaveBeenCalledWith('14');
    expect(mockHookFuncs.setHistory).toHaveBeenCalledWith('7+7 =');
    jest.clearAllMocks();

    result = 99999980000001;
    calcProps = {calc: '9999999x9999999', ...mockHookFuncs} as unknown as CalcProps;
    calcCore.applyCalcResult(result, calcProps);
    expect(mockHookFuncs.setCalc).toHaveBeenCalledWith('9.999998e+13');
    expect(mockHookFuncs.setHistory).toHaveBeenCalledWith('9999999x9999999 =');
  });

  describe(`calculateSum - Should try the calculation for validation or for real`, () => {
    let spies: Spies;

    beforeEach(() => {
      spies = {
        evaluate: jest.spyOn(calcCore.mathJs, 'evaluate').mockReturnValue(7)
      };
    });

    afterEach(() => {
      spiesMockRestore(spies);
    });

    it(`calculateSum - Should get a finalCalc string by calling replaceMultiply`, () => {
      const spies = {
        replaceMultiply: jest.spyOn(calcCore, 'replaceMultiply')
      };
      const calcProps = { calc: '1+2x3', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.calculateSum(true, calcProps);
      expect(spies.replaceMultiply).toHaveBeenCalledWith('1+2x3');
      expect(spies.replaceMultiply).toHaveReturnedWith('1+2*3');
    });

    it(`calculateSum - Should call math evaluate with the finalCalc string`, () => {
      const calcProps = { calc: '1+2x3', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.calculateSum(true, calcProps);
      expect(calcCore.mathJs.evaluate).toHaveBeenCalledWith('1+2*3');
    });

    it(`calculateSum - Should return false if evaluate returns undefined`, () => {
      const spies = {
        evaluate: jest.spyOn(calcCore.mathJs, 'evaluate').mockReturnValue(undefined),
      };
      const calcProps = { calc: '1234', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      const result = calcCore.calculateSum(true, calcProps);
      expect(result).toBe(false);
      spiesMockRestore(spies);
    });

    it(`calculateSum - Should return true if evaluate is successful`, () => {
      const spies = {
        evaluate: jest.spyOn(calcCore.mathJs, 'evaluate').mockReturnValue(undefined),
      };
      const calcProps = { calc: '1234', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      const result = calcCore.calculateSum(true, calcProps);
      expect(result).toBe(false);
      spiesMockRestore(spies);
    });

    it(`calculateSum - Should return false if evaluate if evaluate throws an error`, () => {
      const spies = {
        evaluate: jest.spyOn(calcCore.mathJs, 'evaluate').mockImplementation(() => { throw new Error(); }),
      };
      const calcProps = { calc: '1xx1', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      const result = calcCore.calculateSum(true, calcProps);
      expect(result).toBe(false);
      spiesMockRestore(spies);
    });

    it(`calculateSum - If called 'for real', Should applyCalcResult with the result`, () => {
      const spies = {
        applyCalcResult: jest.spyOn(calcCore, 'applyCalcResult')
      };
      const calcProps = { calc: '1+2x3', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.calculateSum(true, calcProps);
      expect(spies.applyCalcResult).toHaveBeenCalledWith(7, calcProps);
      spiesMockRestore(spies);
    });

    it(`calculateSum - If not called 'for real', should not applyCalcResult with the result`, () => {
      const spies = {
        applyCalcResult: jest.spyOn(calcCore, 'applyCalcResult')
      };
      const calcProps = { calc: '1+2x3', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.calculateSum(false, calcProps);
      expect(spies.applyCalcResult).not.toHaveBeenCalled();
      spiesMockRestore(spies);
    });
  });

  it(`invalidFlash - Should flash indicating invalid`, () => {
    const calcProps = (mockHookFuncs as unknown) as CalcProps;
    calcCore.invalidFlash(calcProps);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(mockHookFuncs.setValidity).toHaveBeenCalledWith('invalid');
    expect(mockHookFuncs.setValidity).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    expect(mockHookFuncs.setValidity).toHaveBeenCalledTimes(2);
    expect(mockHookFuncs.setValidity).toHaveBeenCalledWith('valid');
  });

  describe(`validCalculation - Should return a boolean on testing the calculations validity`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ {calc: '1+2x3x',  newInput: 'x'}, '1+2x3',  false ],
      [ {calc: '1+2x3x',  newInput: '/'}, '1+2x3',  true  ],
      [ {calc: '1+2x3x',  newInput: '='}, '1+2x3x', false ],
      [ {calc: '1+2x3.',  newInput: '.'}, '1+2x3.', false ],
      [ {calc: '1+2x3.',  newInput: '0'}, '1+2x3.', true  ],
      [ {calc: '1+2x0.',  newInput: '0'}, '1+2x0.', true  ],
      [ {calc: '',        newInput: '.'}, '',       true  ],
      [ {calc: '0.',      newInput: '.'}, '0.',     false ]
    ];

    test.each(cases)('validCalculation(%s) returns %b', (calcProps: CalcProps, lastOperatorChecked: string, expected: boolean) => {
      // prettier-ignore
      const spies = {
        replaceOperationCheck: jest.spyOn(calcCore, 'replaceOperatorCheck'),
        calculateSum:          jest.spyOn(calcCore, 'calculateSum')
      };
      const calcPropsWithHooks:CalcProps = { ...calcProps, ...mockHookFuncs };
      const result = calcCore.validCalculation(calcPropsWithHooks);
      if (spies.replaceOperationCheck.mock.calls.length) {
        expect(spies.replaceOperationCheck).toHaveBeenCalledWith(calcPropsWithHooks);
        expect(spies.calculateSum).toHaveBeenCalledWith(false, calcPropsWithHooks, lastOperatorChecked + calcProps.newInput + '0');
      }
      expect(result).toBe(expected);
    });
  });

  describe(`handleInput - Should evaluate the input and return appropriately`, () => {
    let spies: Spies;

    beforeEach(() => {
      // prettier-ignore
      spies = {
        resetCalc:        jest.spyOn(calcCore, 'resetCalc'),
        deleteFromCalc:   jest.spyOn(calcCore, 'deleteFromCalc'),
        calculateSum:     jest.spyOn(calcCore, 'calculateSum'),
        invalidFlash:     jest.spyOn(calcCore, 'invalidFlash'),
        validCalculation: jest.spyOn(calcCore, 'validCalculation'),
        addToCalc:        jest.spyOn(calcCore, 'addToCalc'),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it(`handleInput - Should return resetCalc if newInput is 'Clear'`, () => {
      const calcProps = { calc: '1+2x3', newInput: 'Clear', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.handleInput(calcProps);
      expect(spies.resetCalc).toHaveBeenCalledWith(calcProps);
      expect(spies.deleteFromCalc).not.toHaveBeenCalled();
      expect(spies.calculateSum).not.toHaveBeenCalled();
      expect(spies.invalidFlash).not.toHaveBeenCalled();
      expect(spies.validCalculation).not.toHaveBeenCalled();
      expect(spies.addToCalc).not.toHaveBeenCalled();
      spiesMockRestore(spies);
    });

    it(`handleInput - Should return deleteFromCalc if newInput is 'Del'`, () => {
      const calcProps = { calc: '1+2x3', newInput: 'Del', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.handleInput(calcProps);
      expect(spies.resetCalc).not.toHaveBeenCalled();
      expect(spies.deleteFromCalc).toHaveBeenCalledWith(calcProps);
      expect(spies.calculateSum).not.toHaveBeenCalled();
      expect(spies.invalidFlash).not.toHaveBeenCalled();
      expect(spies.validCalculation).not.toHaveBeenCalled();
      expect(spies.addToCalc).not.toHaveBeenCalled();
      spiesMockRestore(spies);
    });

    it(`handleInput - Should return calculateSum if newInput is '=' and calc is valid`, () => {
      const calcProps = { calc: '1+2x3', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.handleInput(calcProps);
      expect(spies.resetCalc).not.toHaveBeenCalled();
      expect(spies.deleteFromCalc).not.toHaveBeenCalled();
      expect(spies.calculateSum).toHaveBeenCalledWith(true, calcProps);
      expect(spies.invalidFlash).not.toHaveBeenCalled();
      expect(spies.validCalculation).not.toHaveBeenCalled();
      expect(spies.addToCalc).not.toHaveBeenCalled();
      spiesMockRestore(spies);
    });

    it(`handleInput - Should return invalidFlash if newInput is '=' and calc is invalid`, () => {
      const calcProps = { calc: '1+2x3x', newInput: '=', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.handleInput(calcProps);
      expect(spies.resetCalc).not.toHaveBeenCalled();
      expect(spies.deleteFromCalc).not.toHaveBeenCalled();
      expect(spies.calculateSum).toHaveBeenCalledWith(true, calcProps);
      expect(spies.invalidFlash).toHaveBeenCalledWith(calcProps);
      expect(spies.validCalculation).not.toHaveBeenCalled();
      expect(spies.addToCalc).not.toHaveBeenCalled();
      spiesMockRestore(spies);
    });

    it(`handleInput - Should check validCalculation call addToCalc if true`, () => {
      const calcProps = { calc: '4+5x6.1', newInput: '2', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.handleInput(calcProps);
      expect(spies.resetCalc).not.toHaveBeenCalled();
      expect(spies.deleteFromCalc).not.toHaveBeenCalled();
      // expect(spies.calculateSum).not.toHaveBeenCalled(); NOTE: validCalculation will call this
      expect(spies.invalidFlash).not.toHaveBeenCalled();
      expect(spies.validCalculation).toHaveBeenCalledWith(calcProps);
      expect(spies.addToCalc).toHaveBeenCalledWith(calcProps);
      spiesMockRestore(spies);
    });

    it(`handleInput - Should check validCalculation and call invalidFlash if false`, () => {
      const calcProps = { calc: '4+5x6.1', newInput: '.', history: '', ...mockHookFuncs } as CalcProps;
      calcCore.handleInput(calcProps);
      expect(spies.resetCalc).not.toHaveBeenCalled();
      expect(spies.deleteFromCalc).not.toHaveBeenCalled();
      // expect(spies.calculateSum).not.toHaveBeenCalled(); NOTE: validCalculation will call this
      expect(spies.validCalculation).toHaveBeenCalledWith(calcProps);
      expect(spies.addToCalc).not.toHaveBeenCalled();
      expect(spies.invalidFlash).toHaveBeenCalledWith(calcProps);
      spiesMockRestore(spies);
    });
  });

});
