import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { PasswordForm } from 'src/PasswordForm';
import { WebWorkerContextProvider } from 'src/WebWorkerContext';
import { customDarkTheme } from 'src/theme';

function App() {
  return (
    <ThemeProvider theme={customDarkTheme}>
      <WebWorkerContextProvider>
        <CssBaseline />
        <main>
          <PasswordForm />
        </main>
      </WebWorkerContextProvider>
    </ThemeProvider>
  );
}

export default App;
