import App from './app';

console.log('in index.js')
const root = document.getElementById('root');

const html = App();
root.innerHTML = html;
