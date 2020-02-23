This is a code exercise, creating a calculator application in React :)

- Typescript flavour of React.
- Functional Component approach with Hooks.
- Calculator logic as abstracted module of pure functions.
- Math calculations delegated to Math.Js
- Tooling with Prettier + StyleLint, lint-staged, Husky, eslint + typescript-eslint. Enzyme. React Testing Library.
- Bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Features:

- Calculator inputs can be made by click action on buttons, or by keyboard entry event listener.
- Keyboard entry turns the calculator into a cool disco floor effect :)
- Calculator inputs are validated to ensure only valid calculations are entered.
- Calculations are displayed with selective space padding:
  - If entering '1','x','-','2','+','3' this will display as '1 x -2 + 3'.
- If an invalid input is made, this is blocked and the display flashes with a red border.
- Intelligent treatment of input entry.
  - For example entering '1 x +' will result a replacement of the 'x' operator to a '+'.
  - For example entering '1 x -' will retain the '-' operator in expectation of negative value.
  - Entering a '.' will automatically prefix with a '0' if appropriate.
  - Entering a number after where there is a '0' will replace the '0' if appropriate.
- Previous answer will show in history when calculation input resumes.
- Previous calculation will show in history when answer is calculated and displayed. 
- 100% coverage via blackbox testing at the functional component level. Wrapper clicks + reading.
- 100% coverage via whitebox testing / unit tests at the core calculator logic module.

#Version number: 04fa1404c2b3b7be0e5909d4ba93d1332bc76e98

## Available Scripts

In the project directory, you can run:

### `npm install` or `yarn install`

To first install required NPM packages

### `npm start` or `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test` or `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run test:c` or `yern run test:c`

With test coverage reports.

### `npm build` or `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm eject`  or `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
