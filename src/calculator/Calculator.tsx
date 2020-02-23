import React, { FunctionComponent, useState } from 'react';
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const newInput = (event.target as HTMLButtonElement).value;
    const calcProps: CalcProps = { newInput, calc, setCalc, history, setHistory, setValidity };
    calcCore.handleInput(calcProps);
  };

  return (
    <div className="calculator">
      <div className="calc-container">
        <div className="branding">
          <img className="logo" src={Logo} alt="[=] Equal Experts" />
        </div>
        <div className={`display ${valid}`} title={calc}>
          <bdi className="history">{history}</bdi>
          <div className="result">
            <bdi title={calc}>{calc || <span>0</span>}</bdi>
          </div>
        </div>
        {inputs.map(input => (
          <button
            onClick={handleClick}
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
