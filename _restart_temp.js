
console.log('🚀 Wolf Bot Restarting...');
console.log('⏳ Please wait...');
setTimeout(() => {
    require('child_process').spawn('npm', ['start'], {
        stdio: 'inherit',
        shell: true
    });
}, 1000);
