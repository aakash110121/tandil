import { registerRootComponent } from 'expo';
import { initSentry } from './src/utils/sentry';
import App from './App';

// Init Sentry first so any crash (e.g. white screen) is reported to Sentry
initSentry();

registerRootComponent(App);
