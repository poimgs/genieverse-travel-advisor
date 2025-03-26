import express from 'express';
import cors from 'cors';
import { vectorStore, getEmbeddings } from './embedding.js';
import { loadAndProcessData, allLocations } from './dataProcessor.js';
import { createChatCompletion } from './openai.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Load and process data during initialization
const { filters: filterOptions } = await loadAndProcessData();

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

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await createChatCompletion(messages);
    res.json(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Filter options and vector store loaded and ready');
});
