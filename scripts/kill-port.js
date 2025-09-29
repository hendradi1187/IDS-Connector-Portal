const { exec } = require('child_process');
const os = require('os');

const PORT = process.argv[2] || 9002;

function killPort(port) {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let command;

    if (platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -ti :${port}`;
    }

    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`No process found running on port ${port}`);
        resolve();
        return;
      }

      let killCommand;
      if (platform === 'win32') {
        const lines = stdout.trim().split('\n');
        const pids = [...new Set(lines
          .map(line => {
            const parts = line.trim().split(/\s+/);
            return parts[parts.length - 1];
          })
          .filter(pid => pid && !isNaN(pid) && pid !== '0'))];

        if (pids.length === 0) {
          console.log(`No process found running on port ${port}`);
          resolve();
          return;
        }

        killCommand = `taskkill /F /PID ${pids.join(' /PID ')}`;
      } else {
        const pids = stdout.trim().split('\n').filter(pid => pid);
        if (pids.length === 0) {
          console.log(`No process found running on port ${port}`);
          resolve();
          return;
        }
        killCommand = `kill -9 ${pids.join(' ')}`;
      }

      exec(killCommand, (killError) => {
        if (killError) {
          if (killError.message.includes('not found') || killError.message.includes('No such process')) {
            console.log(`Process on port ${port} was already terminated`);
            resolve();
          } else {
            console.error(`Error killing process on port ${port}:`, killError.message);
            reject(killError);
          }
        } else {
          console.log(`Successfully killed process running on port ${port}`);
          resolve();
        }
      });
    });
  });
}

async function main() {
  try {
    await killPort(PORT);
  } catch (error) {
    console.error('Failed to kill port:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { killPort };