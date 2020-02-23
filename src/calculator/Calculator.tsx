import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import Logo from './assets/logo.svg';
import './Calculator.scss';

import { calcCore, CalcProps } from './calc-core';

const Calculator = (): React.ReactComponentElement<FunctionComponent> => {
  // prettier-ignore
  const inputs = [
    '7','8','9','x',
    '4','5','6','-',
    '1','2','3','+',
    '0','.','=','/',
    'Del','Clear'
  ];

  const [calc, setCalc] = useState('');
  const [valid, setValidity] = useState('valid');
  const [history, setHistory] = useState('');
  const buttonRefs: React.MutableRefObject<any> = useRef(Object.fromEntries(inputs.map(input => [`button_${input}`, React.createRef()])));

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const newInput = (event.target as HTMLButtonElement).value;
    const calcProps: CalcProps = { newInput, calc, setCalc, history, setHistory, setValidity };
    calcCore.handleInput(calcProps);
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    const key = calcCore.keyMap[event.key] ?? event.key;
    if (inputs.includes(key)) {
      const button = buttonRefs.current[`button_${key}`];
      button.current.classList.add('active');
      button.current.click();
      setTimeout(() => {
        button.current.classList.remove('active');
      }, 300);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className="calculator">
      <div className="calc-container">
        <div className="branding">
          <img className="logo" src={Logo} alt="[=] Equal Experts" />
        </div>
        <div className={`display ${valid}`} title={calc}>
          <bdi className="history">{calcCore.padOperations(history)}</bdi>
          <div className="result">
            <bdi title={calcCore.padOperations(calc)}>{calcCore.padOperations(calc) || <span>0</span>}</bdi>
          </div>
        </div>
        {inputs.map(input => (
          <button
            onClick={handleClick}
            ref={buttonRefs.current[`button_${input}`]}
            data-testid={`button-${input.toLowerCase()}`}
            className={`button-${input.toLowerCase()}`}
            value={input}
            key={input}
          >
            {input}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
