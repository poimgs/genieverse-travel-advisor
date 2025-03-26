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

export { vectorStore, getEmbeddings };
