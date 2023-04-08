import './app.css'
import App from './App.svelte'
import { globalSettings } from './globalSettings';

const app = new App({
  target: document.getElementById('app'),
});

const newColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
changeTheme(newColorScheme);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  const newColorScheme = event.matches ? "dark" : "light";
  
  changeTheme(newColorScheme);
});

window.electronAPI.onThemeChange(changeTheme);

function changeTheme(theme: 'dark' | 'light') {
  globalSettings.update((old) => {
    old.theme = theme;
    
    if (theme === 'dark') {
      document.documentElement.classList.value = 'dark';
    } else {
      document.documentElement.classList.value = '';
    }

    return old;
  });
}

export default app;
