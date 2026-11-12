const mongoose = require('mongoose');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let spawnedMongoProcess = null;

const findMongodPath = () => {
  const commonPaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe'
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }

  try {
    const res = execSync('where mongod', { encoding: 'utf-8' });
    const firstLine = res.split(/\r?\n/)[0].trim();
    if (firstLine && fs.existsSync(firstLine)) return firstLine;
  } catch (_) {}

  return 'mongod';
};

const startLocalMongoServer = async () => {
  return new Promise((resolve, reject) => {
    const mongodPath = findMongodPath();
    const dbDir = path.resolve(__dirname, '../data/db');

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    console.log(`Starting local MongoDB daemon using: ${mongodPath} ...`);
    
    const proc = spawn(
      mongodPath,
      ['--dbpath', dbDir, '--port', '27017', '--bind_ip', '127.0.0.1'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    spawnedMongoProcess = proc;

    let isResolved = false;

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Waiting for connections') && !isResolved) {
        isResolved = true;
        console.log('Local MongoDB daemon is ready and accepting connections.');
        resolve();
      }
    });

    proc.stderr.on('data', (data) => {
      console.warn('mongod stderr:', data.toString());
    });

    proc.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        reject(err);
      }
    });

    proc.on('exit', (code) => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error(`MongoDB process exited early with code ${code}`));
      }
    });

    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        resolve();
      }
    }, 5000);
  });
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wallet_app';
  const isSrv = uri.startsWith('mongodb+srv://');
  const isLocalhost = uri.includes('127.0.0.1') || uri.includes('localhost');
  const isCloudOrProduction = isSrv || !isLocalhost || !!process.env.RENDER || process.env.NODE_ENV === 'production';

  const connectionOptions = {
    serverSelectionTimeoutMS: 8000
  };

  if (!isSrv && isLocalhost) {
    connectionOptions.directConnection = true;
  }

  try {
    console.log(`Connecting to MongoDB at: ${uri.replace(/:([^:@]+)@/, ':****@')} ...`);
    const conn = await mongoose.connect(uri, connectionOptions);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    if (isCloudOrProduction) {
      console.error('MongoDB cloud connection failed:', err.message);
      throw err;
    }

    console.warn(`Local connection attempt failed (${err.message}). Launching local MongoDB daemon...`);
    try {
      await startLocalMongoServer();
      const conn = await mongoose.connect(uri, connectionOptions);
      console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    } catch (launchErr) {
      console.error('Failed to start/connect to local MongoDB:', launchErr.message);
      throw launchErr;
    }
  }
};

process.on('SIGINT', () => {
  if (spawnedMongoProcess) {
    spawnedMongoProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (spawnedMongoProcess) {
    spawnedMongoProcess.kill();
  }
  process.exit(0);
});

module.exports = { connectDB };
