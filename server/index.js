import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Load and process CSV data during initialization
let allLocations = [];
const filterOptions = await new Promise((resolve, reject) => {
  const results = [];
  fs.createReadStream(path.join(__dirname, 'data', 'locations.csv'))
    .pipe(parse({ 
      columns: true,
      trim: true,
      skipEmptyLines: true 
    }))
    .on('data', (data) => {
      results.push(data);
      // Process the data for storage
      allLocations.push({
        title: data[Object.keys(data)[0]],
        link: data['link'],
        address: data['Address'],
        content: data['content'],
        location: data['Location / Area'],
        categories: data['Category / Type'] ? data['Category / Type'].split('\n').filter(Boolean) : [],
        themes: data['Theme / Highlights'] ? data['Theme / Highlights'].split('\n').filter(Boolean) : [],
        priceRange: data['Price Range'],
        audiences: data['Audience / Suitability'] ? data['Audience / Suitability'].split('\n').filter(Boolean) : [],
        operatingHours: data['Operating Hours']
      });
    })
    .on('end', () => {
      const filters = {
        location: [...new Set(results.map(r => r['Location / Area']).filter(Boolean))],
        category: [...new Set(results.flatMap(r => (r['Category / Type'] || '').split('\n')).filter(Boolean))],
        theme: [...new Set(results.flatMap(r => (r['Theme / Highlights'] || '').split('\n')).filter(Boolean))],
        price: [...new Set(results.map(r => r['Price Range']).filter(Boolean))],
        audiences: [...new Set(results.flatMap(r => (r['Audience / Suitability'] || '').split('\n')).filter(Boolean))]
      };
      resolve(filters);
    })
    .on('error', reject);
});

// Endpoint to get filter options
app.get('/api/filters', (req, res) => {
  res.json(filterOptions);
});

// Endpoint to get all locations
app.get('/api/locations', (req, res) => {
  res.json(allLocations);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Filter options loaded and ready');
});
