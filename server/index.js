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

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, locationIds, userPrompt } = req.body;
    
    // Validate required parameters
    if (!messages || !Array.isArray(locationIds) || !userPrompt) {
      return res.status(400).json({ 
        error: 'Missing required parameters: messages, locationIds (array), and userPrompt' 
      });
    }

    const response = await createChatCompletion(messages, locationIds, userPrompt);
    
    // Stream the response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let accumulatedContent = '';
    
    try {
      for await (const chunk of response) {
        if (chunk.choices[0]?.delta?.tool_calls) {
          const toolCall = chunk.choices[0].delta.tool_calls[0];
          if (toolCall.function?.name === 'retrieve_locations') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const locations = await handleLocationRetrieval(args.location_ids, args.user_prompt);
              res.write(`data: ${JSON.stringify({ 
                type: 'tool_response',
                name: 'retrieve_locations',
                content: locations 
              })}\n\n`);
            } catch (toolError) {
              console.error('Tool execution error:', toolError);
              res.write(`data: ${JSON.stringify({ 
                type: 'error',
                content: 'Failed to retrieve locations' 
              })}\n\n`);
            }
          }
        } else if (chunk.choices[0]?.delta?.content) {
          accumulatedContent += chunk.choices[0].delta.content;
          try {
            // Try to parse the accumulated content as JSON
            const jsonContent = JSON.parse(accumulatedContent);
            res.write(`data: ${JSON.stringify({ 
              type: 'content',
              content: jsonContent.response,
              locationIds: jsonContent.location_ids
            })}\n\n`);
            accumulatedContent = ''; // Reset after successful parse
          } catch (jsonError) {
            // If it's not valid JSON yet, continue accumulating
            res.write(`data: ${JSON.stringify({ 
              type: 'partial',
              content: chunk.choices[0].delta.content 
            })}\n\n`);
          }
        }
      }
      
      // Final check for any remaining content
      if (accumulatedContent) {
        try {
          const jsonContent = JSON.parse(accumulatedContent);
          res.write(`data: ${JSON.stringify({ 
            type: 'content',
            content: jsonContent.response,
            locationIds: jsonContent.location_ids
          })}\n\n`);
        } catch (jsonError) {
          console.error('Failed to parse final JSON content:', jsonError);
          res.write(`data: ${JSON.stringify({ 
            type: 'error',
            content: 'Failed to parse response JSON' 
          })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        content: 'Stream processing failed' 
      })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ error: 'Failed to process chat completion' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Filter options and vector store loaded and ready');
});
