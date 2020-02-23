import { calcCore, CalcProps } from './calc-core';

describe('Calc Helper', () => {
  const mockHookFuncs = {
    setCalc: jest.fn(),
    setHistory: jest.fn(),
    setValidity: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`resetCalc - Should set the calc value to '0' and lastInput to an empty string`, () => {
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

  describe(`toExponentialCheckApply - Should return an exponential value string the result to string length is greater than 10`, () => {
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

});
