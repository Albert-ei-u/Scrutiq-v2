const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const keyMatch = envFile.match(/GEMINI_API_KEY=([^\s]+)/);

if (keyMatch && keyMatch[1]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyMatch[1]}`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        let output = "AVAILABLE MODELS:\n";
        if (parsed.models) {
          parsed.models.forEach(m => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
              output += m.name + "\n";
            }
          });
        }
        fs.writeFileSync('models.txt', output);
        console.log("Written to models.txt");
      } catch(e) { console.error("Parse error."); }
    });
  }).on('error', (e) => {
    console.error("Request error:", e);
  });
} else {
  console.error("No key found.");
}
