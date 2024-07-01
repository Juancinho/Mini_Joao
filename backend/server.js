const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const axios = require('axios');

const app = express();
const port = 3001;
const serverIP = '192.168.0.12'; // Tu dirección IP local

app.use(cors());
app.use(express.json());

let browser;
let page;
let textSession;

async function initializeBrowser() {
  const debuggingPort = 9222;
  const userDataDir = 'C:/Users/tj14o/AppData/Local/Google/Chrome SxS/User Data';
  const executablePath = "C:/Users/tj14o/AppData/Local/Google/Chrome SxS/Application/chrome.exe";

  // Cierra cualquier instancia existente de Chrome Canary
  try {
    execSync('taskkill /F /IM "chrome.exe"');
  } catch (error) {
    console.log('No se encontraron instancias previas de Chrome Canary');
  }

  // Inicia Chrome Canary manualmente con los argumentos necesarios
  const chromeProcess = require('child_process').spawn(executablePath, [
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-site-isolation-trials',
    '--enable-experimental-web-platform-features'
  ], {
    detached: true,
    stdio: 'ignore'
  });

  chromeProcess.unref();

  // Espera a que Chrome Canary esté listo
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Conéctate a la instancia de Chrome Canary en ejecución
  browser = await puppeteer.connect({
    browserURL: `http://localhost:${debuggingPort}`,
    defaultViewport: null,
  });

  page = await browser.newPage();
  await page.goto('https://example.com', { waitUntil: 'networkidle0' });

  // Verifica si window.ai está disponible y crea la sesión
  const aiAvailable = await page.evaluate(async () => {
    if (typeof window.ai === 'undefined') {
      return false;
    }
    window.model = await window.ai.createTextSession();
    return true;
  });

  console.log('window.ai available:', aiAvailable);

  if (!aiAvailable) {
    console.error('window.ai is not available. Check Chrome Canary settings and extensions.');
    throw new Error('window.ai not available');
  }
}

app.post('/api/prompt', async (req, res) => {
  try {
    const { prompt, selectedAI } = req.body;

    console.log('Received request:', { prompt, selectedAI });

    if (selectedAI === 'chrome') {
      if (!page) {
        await initializeBrowser();
      }

      const result = await page.evaluate(async (promptText) => {
        try {
          console.log('Using existing text session...');
          const response = await window.model.prompt(promptText);
          console.log('Prompt response received');
          return { success: true, response };
        } catch (error) {
          console.error('Error in page.evaluate:', error);
          return { success: false, error: error.toString() };
        }
      }, prompt);

      if (!result.success) {
        throw new Error(result.error);
      }

      res.json({ response: result.response });
    } else if (selectedAI === 'llama3') {
      console.log('Sending request to Llama3');

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      try {
        const llama3Response = await axios.post('http://localhost:11434/api/generate', {
          model: "llama3",
          prompt: prompt
        }, {
          responseType: 'stream'
        });

        let fullResponse = '';

        llama3Response.data.on('data', (chunk) => {
          try {
            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              console.log('Received chunk:', line);
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                res.write(`data: ${JSON.stringify({ response: data.response, fullResponse, done: data.done })}\n\n`);
                if (data.done) {
                  res.write(`data: ${JSON.stringify({ response: '', fullResponse, done: true })}\n\n`);
                  res.end();
                }
              }
            }
          } catch (error) {
            console.error('Error processing chunk:', error);
            res.write(`data: ${JSON.stringify({ error: 'Error processing response', details: error.message })}\n\n`);
            res.end();
          }
        });

        llama3Response.data.on('end', () => {
          if (!fullResponse) {
            res.write(`data: ${JSON.stringify({ response: '', fullResponse: 'No response received', done: true })}\n\n`);
          }
          res.end();
        });

        llama3Response.data.on('error', (error) => {
          console.error('Error in Llama3 response stream:', error);
          res.write(`data: ${JSON.stringify({ error: 'Error in Llama3 response stream', details: error.message })}\n\n`);
          res.end();
        });

      } catch (error) {
        console.error('Error sending request to Llama3:', error);
        res.write(`data: ${JSON.stringify({ error: 'Error sending request to Llama3', details: error.message })}\n\n`);
        res.end();
      }
    } else {
      throw new Error('Invalid AI selected');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud.', details: error.message });
  }
});

initializeBrowser().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en http://${serverIP}:${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize browser:', error);
  process.exit(1);
});

process.on('exit', () => {
  if (browser) browser.close();
});