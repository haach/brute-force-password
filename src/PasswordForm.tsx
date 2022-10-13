import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { FC, useState } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { TiDelete } from 'react-icons/ti';
import { useWorker } from 'src/WebWorkerContext';
import { useTimer } from 'src/Timer';

const regexRanges = {
  az: 'a-z',
  AZ: 'A-Z',
  numerical: '0-9',
  special: '!"#$%&\'()*+,-.:;<=>?@[\\]^_`{|}~*/',
};

interface FormValues {
  pass: string;
}

export const PasswordForm: FC = () => {
  const { time, running, start, stop, reset } = useTimer();
  const [result, setResult] = useState<number | null>(null);
  const [detectedRanges, setDetectedRanges] = useState<Array<string>>([]);
  const { worker, registerWebWorker, terminateWebWorker } = useWorker();

  const onWorkerMessage = (e: MessageEvent) => {
    stop(); // Stop timer
    const combinations = e.data;
    setResult(combinations);
  };
  const onWorkerError = (e: ErrorEvent) => {
    console.log('Error in web worker:', e);
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      pass: '',
    },
    validate: (values) => {
      const errors: Partial<FormValues> = {};

      if (!values.pass.trim()) {
        errors.pass = 'You need to enter a password to test';
      }
      if (values.pass.indexOf(' ') >= 0) {
        errors.pass = 'Spaces are not allowed';
      }
      return errors;
    },
    onSubmit: (values) => {
      if (formik.isValid) {
        start(); // Start timer
        registerWebWorker(onWorkerMessage, onWorkerError).then((worker) => {
          // Send form values to worker
          worker.postMessage({
            password: values.pass,
            ranges: detectedRanges,
          });
        });
      }
    },
  });

  const detectRanges = (pass: string) => {
    const newRange = [];
    for (const [key, value] of Object.entries(regexRanges)) {
      if (pass.match(new RegExp(`[${value}]`, 'g'))) {
        newRange.push(key);
      }
    }
    setDetectedRanges(newRange);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack
        spacing={4}
        maxWidth={800}
        sx={{
          margin: 'auto',
        }}
      >
        <Typography variant="h1">Brute force hack my password</Typography>
        <Typography>
          This app is a simple representation of the correlation of a password's
          length, character set and resulting security. Simply enter a test
          password below. The app then will try to guess your password using a
          brute force approach and show the time and combinations needed to get
          to the result.
        </Typography>

        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <Chip
            label="Alphabetical letters"
            size="small"
            icon={
              detectedRanges.includes('az') ? (
                <AiFillCheckCircle />
              ) : (
                <TiDelete />
              )
            }
            color={detectedRanges.includes('az') ? 'success' : undefined}
          />
          <Chip
            label="Capital letters"
            size="small"
            icon={
              detectedRanges.includes('AZ') ? (
                <AiFillCheckCircle />
              ) : (
                <TiDelete />
              )
            }
            color={detectedRanges.includes('AZ') ? 'success' : undefined}
          />
          <Chip
            label="Numerical characters"
            size="small"
            icon={
              detectedRanges.includes('numerical') ? (
                <AiFillCheckCircle />
              ) : (
                <TiDelete />
              )
            }
            color={detectedRanges.includes('numerical') ? 'success' : undefined}
          />
          <Chip
            label="Special characters"
            size="small"
            icon={
              detectedRanges.includes('special') ? (
                <AiFillCheckCircle />
              ) : (
                <TiDelete />
              )
            }
            color={detectedRanges.includes('special') ? 'success' : undefined}
          />
        </Stack>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <TextField
            required
            name="pass"
            label="Your test password"
            variant="outlined"
            disabled={running}
            onChange={(e) => {
              if (time) reset();
              if (result) setResult(null);
              detectRanges(e.target.value);
              formik.validateForm();
              formik.setTouched({ pass: true });
              formik.handleChange(e);
            }}
            value={formik.values.pass}
            helperText={formik.errors.pass}
            error={Boolean(formik.errors.pass && formik.touched.pass)}
            sx={{
              minWidth: 300,
            }}
          />

          <Button variant="outlined" type="submit" disabled={running}>
            Hack it!
          </Button>
        </Stack>
        {running && !result && (
          <Card>
            <CardContent>Running for {time / 10}s</CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => {
                  reset();
                  worker && terminateWebWorker();
                }}
              >
                Stop
              </Button>
            </CardActions>
          </Card>
        )}
        {!running && result && (
          <Card>
            <CardContent>
              Password "{formik.values.pass}" detected{' '}
              {time > 0 ? `in ${time / 10}s` : `in under 1 second`} with{' '}
              {result.toLocaleString()} combinations
            </CardContent>
          </Card>
        )}
        <Alert severity="info">
          The brute force attack is done in your browser. While this is very
          save for testing your passwords, the actual result is dependend on
          your machines computational power and CPU allocated to your browser.
          <br />
          <br />
          In a real world example there is some additional things that need to
          be taken into consideration like the login servers response time or a
          lock out.
        </Alert>
      </Stack>
    </form>
  );
};
