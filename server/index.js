import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';
import HNSWLib from 'hnswlib-node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Initialize vector store
const vectorDimension = 384; // for MiniLM
const maxElements = 10000;
const vectorStore = new HNSWLib.HierarchicalNSW('cosine', vectorDimension);
vectorStore.initIndex(maxElements);

// Initialize transformer pipeline
let embedder;
async function getEmbeddings(text) {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Load and process CSV data during initialization
let allLocations = [];
let locationEmbeddings = [];
const filterOptions = await new Promise((resolve, reject) => {
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

// New endpoint for semantic search
app.post('/api/semantic-search', async (req, res) => {
  try {
    const { query, numResults = 5 } = req.body;
    const queryEmbedding = await getEmbeddings(query);
    
    // Search for similar locations
    const searchResults = vectorStore.searchKnn(queryEmbedding, numResults);
    
    // Map indices to locations
    const results = searchResults.neighbors.map((idx) => ({
      ...allLocations[idx],
      similarity: searchResults.distances[searchResults.neighbors.indexOf(idx)]
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Filter options and vector store loaded and ready');
});
