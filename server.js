// server.js
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());               // for JSON body
app.use(express.urlencoded({ extended: true })); // for form submissions

// POST endpoint to receive answers
app.post('/submit', async (req, res) => {
  try {
    const answers = req.body; // expect an object with 10 answers
    // store to file (optional)
    const id = Date.now();
    const outPath = path.join(__dirname, 'submissions', `${id}.json`);
    fs.mkdirSync(path.join(__dirname, 'submissions'), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(answers, null, 2));

    // call python script with path to saved file or JSON via stdin/args
    const py = spawn('python3', ['run_script.py', outPath], { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';
    py.stdout.on('data', data => { stdout += data.toString(); });
    py.stderr.on('data', data => { stderr += data.toString(); });

    py.on('close', code => {
      if (code === 0) {
        res.json({ status: 'ok', result: stdout.trim() });
      } else {
        console.error('Python error:', stderr);
        res.status(500).json({ status: 'error', error: stderr || 'python failed' });
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

