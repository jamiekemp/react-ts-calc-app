import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import Calculator from './Calculator';

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

  describe(`handleClick - should result in a calculation on the display + Clear it`, () => {
    // prettier-ignore
    const InputCases: Array<Array<any>> = [
      [ '0.1+0.2',        '0.1+0.2'      ],
      [ '0.1+0.2=',       '0.3'          ],
      [ '.1+.2',          '0.1+0.2'      ],
      [ '.1+.2=',         '0.3'          ],
      [ '3+2-1',          '3+2-1'        ],
      [ '3+2-1=',         '4'            ],
      [ '-5+2-1',         '-5+2-1'       ],
      [ '-5+2-1=',        '-4'           ],
      [ '5x-2-1',         '5x-2-1'       ],
      [ '5x-2-1=',        '-11'          ],
      [ '9-5x2',          '9-5x2'        ],
      [ '9-5x2=',         '-1'           ],
      [ '5+9',            '5+9'          ],
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

  describe(`handleClick - Del should delete the last character`, () => {
    // prettier-ignore
    const cases: Array<Array<any>> = [
      [ '0.1+0.2', '0.1+0.' ],
      [ '.1+.2',   '0.1+0.' ],
      [ '3+2-1',   '3+2-'   ],
      [ '-5+2-1',  '-5+2-'  ],
      [ '5x-2-1',  '5x-2-'  ],
      [ '9-5x2',   '9-5x'   ],
      [ '5+9',     '5+'     ],
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
      [ '1x+/',  '1/',  false ],
      [ '2+/x',  '2x',  false ],
      [ '1x-',   '1x-', false ],
      [ '1x-/',  '1x-', true  ],
      [ '1x-/=', '1x-', true  ],
      [ '2+-',   '2+-', false ],
      [ '2+-x',  '2+-', true  ],
      [ '2+-x=', '2+-', true  ],
      [ '3/-',   '3/-', false ],
      [ '3/-/',  '3/-', true  ],
      [ '4/-',   '4/-', false ],
      [ '4/-x',  '4/-', true  ],
      [ '4/-x=', '4/-', true  ],
      [ '1.2.',  '1.2', true  ],
      [ '1x-',   '1x-', false ],
      [ '1x--',  '1x-', true  ],
      [ '1x--=', '1x-', true  ],
      [ '1x+',   '1+',  false ],
      [ '1x++',  '1+',  true  ],
      [ '1x++=', '1+',  true  ],
      [ '2+x',   '2x',  false ],
      [ '2+xx',  '2x',  true  ],
      [ '2+xx=', '2x',  true  ],
      [ '3-/',   '3/',  false ],
      [ '3-//',  '3/',  true  ],
      [ '3-//=', '3/',  true  ],
      [ '4-x',   '4x',  false ],
      [ '4-xx',  '4x',  true  ],
      [ '4-xx=', '4x',  true  ],
      [ '5x-',   '5x-', false ],
      [ '5x--',  '5x-', true  ],
      [ '5x--=', '5x-', true  ],
      [ '6/-',   '6/-', false ],
      [ '6/--',  '6/-', true  ],
      [ '6/--=', '6/-', true  ],
      [ '7x+',   '7+',  false ],
      [ '7x++',  '7+',  true  ],
      [ '7x++=', '7+',  true  ],
      [ '1.2.',  '1.2', true  ],
      [ '.',     '0.',  false ],
      [ '..',    '0.',  true  ]
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
