import React from 'react';
import {render, fireEvent, act,} from '@testing-library/react';
import { shallow, ShallowWrapper } from 'enzyme';
import Calculator from './Calculator';
import { calcCore } from './calc-core';

jest.useFakeTimers();

describe('<Calculator />', () => {
  let wrapper: ShallowWrapper<{}>;

  beforeEach(() => {
    wrapper = shallow(<Calculator />);
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<Calculator />);
  });

  describe(`handleKeyDown - should simulate mouse events on the calculator`, () => {
    // prettier-ignore
    const cases = [
      '7','8','9','x',
      '4','5','6','-',
      '1','2','3','+',
      '0','.','=','/'
    ];

    test.each(cases)(`handleClick() called with newInput: '%s'`, key => {
      const { container, getByTestId } = render(<Calculator />);
      fireEvent.keyDown(container, { key });
      const mockCalcProps = {
        calc: '',
        newInput: key
      };
      expect(getByTestId(`button-${key}`)).toHaveClass('active');
      expect(calcCore.handleInput).toHaveBeenCalledWith(expect.objectContaining(mockCalcProps));
      act(() => { jest.runAllTimers(); });
      expect(getByTestId(`button-${key}`)).not.toHaveClass('active');
    });
  });

  describe(`handleClick - should pass the button clicked value to the calc core`, () => {
    const handleInput = jest.spyOn(calcCore, 'handleInput');
    // prettier-ignore
    const cases = [
      '7','8','9','x',
      '4','5','6','-',
      '1','2','3','+',
      '0','.','=','/',
      'Del', 'Clear'
    ];

    test.each(cases)(`handleClick() called with newInput: '%s'`, value => {
      const mockedEvent = { target: { value } };
      const mockCalcProps = {
        calc: '',
        newInput: value
      };

      wrapper
        .find({ value })
        .first()
        .simulate('click', mockedEvent);

      const callParams = handleInput.mock.calls[0][0];
      expect(callParams.newInput).toBe(value);
      expect(callParams).toHaveProperty('calc');
      expect(callParams).toHaveProperty('setCalc');
      expect(calcCore.handleInput).toHaveBeenCalledWith(expect.objectContaining(mockCalcProps));
    });
  });

  describe(`handleClick - should update the button clicked value to the calculator display`, () => {
    // prettier-ignore
    const cases = [
      '7','8','9',
      '4','5','6',
      '1','2','3',
      '0'
    ];

    test.each(cases)(`handleClick() called with newInput: '%s'`, value => {
      const mockedEvent = { target: { value } };
      wrapper
        .find({ value })
        .first()
        .simulate('click', mockedEvent);
      expect(wrapper.find('.result').text()).toBe(value);
    });
  });

  describe(`handleClick - should result in a calculation on the display + Clear it`, () => {
    // prettier-ignore
    const InputCases: Array<Array<any>> = [
      [ '0.1+0.2',        '0.1 + 0.2'    ],
      [ '0.1+0.2=',       '0.3'          ],
      [ '.1+.2',          '0.1 + 0.2'    ],
      [ '.1+.2=',         '0.3'          ],
      [ '3+2-1',          '3 + 2 - 1'    ],
      [ '3+2-1=',         '4'            ],
      [ '-5+2-1',         '-5 + 2 - 1'   ],
      [ '-5+2-1=',        '-4'           ],
      [ '5x-2-1',         '5 x -2 - 1'   ],
      [ '5x-2-1=',        '-11'          ],
      [ '9-5x2',          '9 - 5 x 2'    ],
      [ '9-5x2=',         '-1'           ],
      [ '5+9',            '5 + 9'        ],
      [ '5+9=',           '14'           ],
      [ '999999x999999=', '9.999980e+11' ]
    ];

    test.each(InputCases)(`handleClick() called with newInput: '%s'`, (inputs: string, display: string) => {
      inputs.split('').forEach(value => {
        const mockedEvent = { target: { value } };
        wrapper
          .find({ value })
          .first()
          .simulate('click', mockedEvent);
      });
      expect(wrapper.find('.result').text()).toBe(display);

      const value = 'Clear';
      const mockedEvent = { target: { value } };
      wrapper
        .find({ value })
        .first()
        .simulate('click', mockedEvent);
      expect(wrapper.find('.result').text()).toBe('0');
    });
  });

  describe(`handleClick - should result in a calculation/result in the history`, () => {
    // prettier-ignore
    const InputCases: Array<Array<any>> = [
      [ '0.1+0.2=',  '0.1 + 0.2 =' ],
      [ '0.1+0.2=x', 'Ans = 0.3'   ],
      [ '.1+.2=',    '0.1 + 0.2 =' ],
      [ '.1+.2=x',   'Ans = 0.3'   ],
      [ '3+2-1=',    '3 + 2 - 1 =' ],
      [ '3+2-1=x',   'Ans = 4'     ]
    ];

    test.each(InputCases)(`handleClick() called with newInput: '%s'`, (inputs: string, history: string) => {
      // inputs.split('').forEach(value => {
      inputs.split('').forEach(value => {
        const mockedEvent = { target: { value } };
        wrapper
          .find({ value })
          .first()
          .simulate('click', mockedEvent);
      });
      expect(wrapper.find('.history').text()).toBe(history);
    });
  });

  describe(`handleClick - Del should delete the last character`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ '0.1+0.2', '0.1 + 0.'  ],
      [ '.1+.2',   '0.1 + 0.'  ],
      [ '3+2-1',   '3 + 2 - '  ],
      [ '-5+2-1',  '-5 + 2 - ' ],
      [ '5x-2-1',  '5 x -2 - ' ],
      [ '9-5x2',   '9 - 5 x '  ],
      [ '5+9',     '5 + '      ]
    ];

    test.each(cases)(`handleClick() called with newInput: '%s'`, (inputs: string, display: string) => {
      // inputs.split('').forEach(value => {
      inputs.split('').forEach(value => {
        const mockedEvent = { target: { value } };
        wrapper
          .find({ value })
          .first()
          .simulate('click', mockedEvent);
      });

      const value = 'Del';
      const mockedEvent = { target: { value } };
      wrapper
        .find({ value })
        .first()
        .simulate('click', mockedEvent);
      expect(wrapper.find('.result').text()).toBe(display);
    });
  });

  describe(`handleClick - Invalid entry to flash invalid and block input action`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ '1x+/',  '1 / ',  false ],
      [ '2+/x',  '2 x ',  false ],
      [ '1x-',   '1 x -', false ],
      [ '1x-/',  '1 x -', true  ],
      [ '1x-/=', '1 x -', true  ],
      [ '2+-',   '2 + -', false ],
      [ '2+-x',  '2 + -', true  ],
      [ '2+-x=', '2 + -', true  ],
      [ '3/-',   '3 / -', false ],
      [ '3/-/',  '3 / -', true  ],
      [ '4/-',   '4 / -', false ],
      [ '4/-x',  '4 / -', true  ],
      [ '4/-x=', '4 / -', true  ],
      [ '1.2.',  '1.2',   true  ],
      [ '1x-',   '1 x -', false ],
      [ '1x--',  '1 x -', true  ],
      [ '1x--=', '1 x -', true  ],
      [ '1x+',   '1 + ',  false ],
      [ '1x++',  '1 + ',  true  ],
      [ '1x++=', '1 + ',  true  ],
      [ '2+x',   '2 x ',  false ],
      [ '2+xx',  '2 x ',  true  ],
      [ '2+xx=', '2 x ',  true  ],
      [ '3-/',   '3 / ',  false ],
      [ '3-//',  '3 / ',  true  ],
      [ '3-//=', '3 / ',  true  ],
      [ '4-x',   '4 x ',  false ],
      [ '4-xx',  '4 x ',  true  ],
      [ '4-xx=', '4 x ',  true  ],
      [ '5x-',   '5 x -', false ],
      [ '5x--',  '5 x -', true  ],
      [ '5x--=', '5 x -', true  ],
      [ '6/-',   '6 / -', false ],
      [ '6/--',  '6 / -', true  ],
      [ '6/--=', '6 / -', true  ],
      [ '7x+',   '7 + ',  false ],
      [ '7x++',  '7 + ',  true  ],
      [ '7x++=', '7 + ',  true  ],
      [ '1.2.',  '1.2',   true  ],
      [ '.',     '0.',    false ],
      [ '..',    '0.',    true  ]
    ];

    test.each(cases)(`handleClick() called with newInput: '%s'`, (inputs: string, display: string, invalid: boolean) => {
      inputs.split('').forEach(value => {
        const mockedEvent = { target: { value } };
        wrapper
          .find({ value })
          .first()
          .simulate('click', mockedEvent);
      });

      expect(!!wrapper.find('.invalid').length).toEqual(invalid);
      expect(wrapper.find('.result').text()).toBe(display);
      jest.runAllTimers();
      expect(wrapper.find('.invalid').length).toBeFalsy();
    });
  });
});
