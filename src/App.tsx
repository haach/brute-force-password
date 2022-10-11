import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTimer } from 'src/Timer';

const bruteForceWorker = new Worker('src/BruteForceWorker.js');

const regexRanges = {
  az: 'a-z',
  AZ: 'A-Z',
  numerical: '0-9',
  special: '!"#$%&\'()*+,-.:;<=>?@[\\]^_`{|}~ */',
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
  const [result, setResult] = useState<number | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      ranges: {
        az: true,
        AZ: false,
        numerical: false,
        special: false,
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
        if (values.pass.indexOf(' ') >= 0) {
          errors.pass = 'Spaces are not allowed';
        } else {
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
      }
      return errors;
    },
    onSubmit: (values) => {
      console.log('values', values);
      if (formik.isValid) {
        start(); // Start timer
        bruteForceWorker.postMessage(values); // Send form values to worker
      }
    },
  });

  const receivedWorkerMessage = (e: MessageEvent) => {
    console.log('e', e);
    stop(); // Stop timer
    const combinations = e.data;
    setResult(combinations);
  };

  bruteForceWorker.onmessage = receivedWorkerMessage;

  return (
    <div>
      <h1>Brute force hack my password</h1>
      <p>
        This app is a simple representation of the correlation in between
        password length, character set and it's security. Simply select the
        allowed character ranges and enter a test password below. <br />
        The app then will try to brute force your password and show the time
        needed to guess your password.
      </p>
      <p>
        The brute force attack is done in your browser. While this is very save
        for testing your passwords, the actual result is dependend on your
        computers computational power and the amount of CPU your browser is
        using from it. In a real world example there is some additional things
        that need to be taken into consideration like the login servers response
        time or a lock out.
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

        {/* <div>
          <label htmlFor="responseTime">Response time in ms</label>
          <input
            type="number"
            name="responseTime"
            id="responseTime"
            onChange={formik.handleChange}
            value={formik.values.responseTime}
          />
        </div> */}

        <div>
          <label htmlFor="pass">Your password</label>
          <input
            disabled={running}
            type="text"
            name="pass"
            id="pass"
            onChange={(e) => {
              //detectRanges();
              setResult(null);
              reset();
              formik.validateForm();
              formik.handleChange(e);
            }}
            value={formik.values.pass}
          />
          {formik.errors.pass && formik.touched.pass ? (
            <span style={{ color: 'red' }}>{formik.errors.pass}</span>
          ) : null}
        </div>

        <button type="submit" disabled={running}>
          Hack it!
        </button>
        {running && !result && <div>Running for {time / 10}s</div>}
        {!running && result && (
          <div>
            Password "{formik.values.pass}" detected{' '}
            {time > 0 ? `in ${time / 10}s` : `in under 1 second`} with{' '}
            {result.toLocaleString()} combinations
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
