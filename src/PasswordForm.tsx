import {
  Alert,
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { FC, useState } from 'react';
import { ChipWithIcon } from 'src/components/ChipWithIcon';
import { useTimer } from 'src/Timer';
import { useWorker } from 'src/WebWorkerContext';

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
    console.error('Error in web worker:', e);
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
        registerWebWorker(onWorkerMessage, onWorkerError)
          .then((worker) => {
            // Send form values to worker
            worker.postMessage({
              password: values.pass,
              ranges: detectedRanges,
            });
          })
          .catch((e) => {
            console.error('e', e);
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
        maxWidth={1000}
        padding={[4, 10]}
        sx={{
          margin: 'auto',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '3.5rem',
          }}
        >
          Brute force hack my password
        </Typography>
        <Typography>
          This app is a simple representation of the correlation of a password's
          length, character set and resulting security. Simply enter a test
          password below. The app then will try to guess your password using a
          brute force algorythm and show the time and combinations needed to get
          to the result.
        </Typography>

        <Box sx={{ display: 'flex', gap: [1, 2, 3], flexWrap: 'wrap' }}>
          <ChipWithIcon
            label="Alphabetical letters"
            isActive={detectedRanges.includes('az')}
          />

          <ChipWithIcon
            label="Capital letters"
            isActive={detectedRanges.includes('AZ')}
          />

          <ChipWithIcon
            label="Numerical characters"
            isActive={detectedRanges.includes('numerical')}
          />

          <ChipWithIcon
            label="Special characters"
            isActive={detectedRanges.includes('special')}
          />
        </Box>

        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <TextField
            required
            autoComplete="off"
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
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '15px 25px',
              borderRadius: '6px',
            }}
          >
            <span>Running for {time / 10}s</span>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                reset();
                worker && terminateWebWorker();
              }}
            >
              Stop
            </Button>
          </Grid>
        )}
        {!running && result && (
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '1rem 1.5rem',
            }}
          >
            Password <b>"{formik.values.pass}"</b> detected{' '}
            {time > 0 ? `in ${time / 10}s` : `in under 1 second`} with{' '}
            {result.toLocaleString()} combinations
          </Box>
        )}
        <Alert severity="info">
          The brute force algorythm runs locally inside your browser. While this
          is very save for testing your passwords, the actual result is
          dependend on your machines computational power and CPU allocated to
          your browser.
          <br />
          In a real world attack there are also some additional factors that
          need to be taken into consideration, like the login server response
          time or lock out time.
        </Alert>
      </Stack>
    </form>
  );
};
