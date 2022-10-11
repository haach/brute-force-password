import { useFormik } from 'formik';
import { useState } from 'react';
import { useTimer } from 'src/Timer';

const regexRanges = {
  az: 'a-z',
  AZ: 'A-Z',
  numerical: '0-9',
  special: '!"#$%&\'()*+,-.:;<=>?@[\\]^_`{|}~ */',
};
const fullCharSets = {
  az: 'abcdefghijklmnopqrstuvwxyz',
  AZ: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numerical: '012',
  special: '!"#$%&\'()*+,-.:;<=>?@[]^_`{|}~ */',
};

interface FormValues {
  ranges: {
    az: boolean;
    AZ: boolean;
    numerical: boolean;
    special: boolean;
  };
  responseTime: number;
  pass: string;
}

function App() {
  const { time, running, start, stop, reset } = useTimer();
  const formik = useFormik<FormValues>({
    initialValues: {
      ranges: {
        az: true,
        AZ: true,
        numerical: true,
        special: true,
      },
      responseTime: 0,
      pass: '',
    },
    validate: (values) => {
      const errors: Partial<FormValues> = {};

      if (!values.pass.trim()) {
        errors.pass = 'You need to enter a password to test';
      }
      if (!!values.pass.trim()) {
        // Dynamically create regex to validate password matches char range
        const getRangeRegex = (ranges: FormValues['ranges']) => {
          let regex = '';
          if (ranges.az) {
            regex = regex + regexRanges.az;
          }
          if (ranges.AZ) {
            regex = regex + regexRanges.AZ;
          }
          if (ranges.numerical) {
            regex = regex + regexRanges.numerical;
          }
          if (ranges.special) {
            regex = regex + regexRanges.special;
          }
          return regex;
        };
        // Get chars that do NOT match the range
        const notMatchRegEx = new RegExp(
          `[^${getRangeRegex(values.ranges)}]`,
          'g'
        );
        const invalidChars = values.pass.match(notMatchRegEx)?.join('');

        if (!!invalidChars?.length) {
          errors.pass = `The password contains these invalid characters: ${invalidChars}`;
        }
      }
      return errors;
    },
    onSubmit: (values) => {
      console.log('values', values);
      if (formik.isValid) {
        console.log('Form is valid');
        const combos = findPassword(values.pass, values.ranges);
        console.log('combos', combos);
      }
    },
  });

  function asyncTimeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function simulateServerResponse(testString: string, password: string) {
    await asyncTimeout(formik.values.responseTime);
    return testString === password;
  }
  function findPassword(password: string, ranges: FormValues['ranges']) {
    const MAX_LENGTH = password.length;
    const ALL_CHARS = Object.entries(fullCharSets)
      .reduce((result, [key, value]) => {
        if (ranges[key]) {
          result = result + value;
        }
        return result;
      }, '')
      .split('');

    let testStringLength = 1;
    let validPassword = null;
    const combinations = [];

    while (testStringLength <= MAX_LENGTH && !validPassword) {
      function fn(prefix, remainingDigits) {
        if (remainingDigits === 1) {
          for (const char of ALL_CHARS) {
            const combo = String(prefix + char);
            combinations.push(combo);
            if (combo === password) return combo;
          }
        } else {
          for (const char of ALL_CHARS) {
            const res = fn(prefix + char, remainingDigits - 1);
            if (res) {
              validPassword = res;
              return res;
            }
          }
        }
      }

      fn('', testStringLength);
      testStringLength++;
    }
    return combinations;
  }

  return (
    <div>
      <h1>Brute force hack my password</h1>
      <p>
        This app is a simple representation of the correlation in between
        password length, character set and it's security. Simply select the
        allowed character ranges and enter fictionary password below. <br />
        The app then will try to brute force your password and show the time
        needed to guess your password.
      </p>
      <p>
        {running ? (
          <button onClick={() => stop()}>STOP</button>
        ) : (
          <button onClick={() => start()}>Start</button>
        )}
        <>useTimer: {time}ms</>
      </p>
      <form onSubmit={formik.handleSubmit}>
        <fieldset>
          <legend>Ranges</legend>
          <div>
            <input
              type="checkbox"
              name="ranges.az"
              id="az"
              checked={formik.values.ranges.az}
              onChange={formik.handleChange}
              value="ranges.az"
            />
            <label htmlFor="az">a-z</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="ranges.AZ"
              id="AZ"
              checked={formik.values.ranges.AZ}
              onChange={formik.handleChange}
              value="ranges.AZ"
            />
            <label htmlFor="AZ">A-Z</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="ranges.numerical"
              id="numerical"
              checked={formik.values.ranges.numerical}
              onChange={formik.handleChange}
              value="ranges.numerical"
            />
            <label htmlFor="numerical">0-9</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="ranges.special"
              id="special"
              checked={formik.values.ranges.special}
              onChange={formik.handleChange}
              value="ranges.special"
            />
            <label htmlFor="special">
              {`!"#$%&'()*+,-./:;<=>?@[\]^_\`{|}~`}
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="responseTime">Response time in ms</label>
          <input
            type="number"
            name="responseTime"
            id="responseTime"
            onChange={formik.handleChange}
            value={formik.values.responseTime}
          />
        </div>

        <div>
          <label htmlFor="pass">Your password</label>
          <input
            type="text"
            name="pass"
            id="pass"
            onChange={formik.handleChange}
            value={formik.values.pass}
          />
        </div>

        {formik.errors.pass && formik.touched.pass ? (
          <div>{formik.errors.pass}</div>
        ) : null}

        <button type="submit">Hack it!</button>
      </form>
    </div>
  );
}

export default App;
