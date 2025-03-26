import { pipeline } from '@xenova/transformers';
import HNSWLib from 'hnswlib-node';

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

// Function to retrieve relevant locations based on user prompt
async function retrieveLocations(locationIds, userPrompt, allLocations) {
  try {
    // Get embeddings for the user prompt
    const promptEmbedding = await getEmbeddings(userPrompt);
    
    // Filter locations by IDs and get their indices
    const filteredIndices = locationIds.map(id => allLocations.findIndex(loc => loc.id === id))
                                     .filter(idx => idx !== -1);
    
    if (filteredIndices.length === 0) {
      return [];
    }

    // Get similarities for filtered locations using kNN search
    const numNeighbors = 5;
    const { distances, neighbors } = vectorStore.searchKnn(promptEmbedding, numNeighbors);
    
    // Map the results to include only filtered indices
    const similarities = neighbors
      .map((neighbor, i) => ({ 
        idx: neighbor,
        similarity: 1 - distances[i]  // Convert distance to similarity (closer to 1 is better)
      }))
      .filter(item => filteredIndices.includes(item.idx));

    // Sort by similarity (higher is better)
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Return top 5 locations with similarity scores
    return similarities.slice(0, 5).map(({ idx, similarity }) => ({
      ...allLocations[idx],
      similarity
    }));
  } catch (error) {
    console.error('Error retrieving locations:', error);
    throw error;
  }
}

export { vectorStore, getEmbeddings, retrieveLocations };
