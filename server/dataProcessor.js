import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import { vectorStore, getEmbeddings } from './embedding.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let allLocations = [];
let locationEmbeddings = [];

async function loadAndProcessData() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, 'data', 'locations.csv'))
      .pipe(parse({ 
        columns: true,
        trim: true,
        skipEmptyLines: true 
      }))
      .on('data', async (data) => {
        const location = {
          id: data[Object.keys(data)[0]].toLowerCase().replace(/\s+/g, '-'),
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
        };
        
        results.push(data);
        allLocations.push(location);
        
        // Create text for embedding
        const textToEmbed = `${location.title}. ${location.content || ''} Located in ${location.location}. ${location.categories.join(', ')}. ${location.themes.join(', ')}.`.trim();
        locationEmbeddings.push(textToEmbed);
      })
      .on('end', async () => {
        const filters = {
          location: [...new Set(results.map(r => r['Location / Area']).filter(Boolean))],
          category: [...new Set(results.flatMap(r => (r['Category / Type'] || '').split('\n')).filter(Boolean))],
          theme: [...new Set(results.flatMap(r => (r['Theme / Highlights'] || '').split('\n')).filter(Boolean))],
          price: [...new Set(results.map(r => r['Price Range']).filter(Boolean))],
          audiences: [...new Set(results.flatMap(r => (r['Audience / Suitability'] || '').split('\n')).filter(Boolean))]
        };
        
        // Generate embeddings and add to vector store
        for (let i = 0; i < locationEmbeddings.length; i++) {
          const embedding = await getEmbeddings(locationEmbeddings[i]);
          vectorStore.addPoint(embedding, i);
        }
        
        resolve({ filters, allLocations });
      })
      .on('error', reject);
  });
}

export { loadAndProcessData, allLocations };
