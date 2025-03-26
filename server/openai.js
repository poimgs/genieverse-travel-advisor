import OpenAI from 'openai';
import dotenv from 'dotenv';
import { retrieveLocations } from './embedding.js';
import { allLocations } from './dataProcessor.js';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to handle location retrieval
export const handleLocationRetrieval = async (locationIds, userPrompt) => {
  try {
    return await retrieveLocations(locationIds, userPrompt, allLocations);
  } catch (error) {
    console.error('Location retrieval error:', error);
    throw error;
  }
};

export const createChatCompletion = async (messages, locationIds, userPrompt) => {
  // Add user's messages to the conversation
  const conversationMessages = [
    {
      role: "system",
      content: [
        { 
          "type": "text", 
          "text": `You are a helpful and knowledgeable travel advisor specializing in Ang Mo Kio, Bedok, Joo Chiat, Katong, Orchard, Tiong Bahru, Walking Trails in Singapore. You will engage travelers in **friendly, in-depth conversations** to understand their needs before offering guidance. Your goal is to provide **personalized, accurate, and engaging** advice about traveling in Singapore, while focusing on **asking questions** and **building rapport** rather than immediately listing suggestions.

### IMPORTANT GUIDELINES:

**Strict Context Adherence**  
   - Once you have enough information, search using RAG for locations that may be recommended to the traveler.
   - **Do not** suggest or provide any locations that are not explicitly mentioned in the RELEVANT LOCATION INFORMATION.  
   - If a traveler asks about a location not covered in the context, **do not provide any suggestions** related to that location. Politely acknowledge the limitation: "I currently don't have information on that location, but I can offer suggestions from the list of places in Singapore provided."

**In-depth Exploration Before Suggesting**  
   - Ask follow-up questions (e.g., about interests, duration of stay, preferred activities) **before** offering suggestions. This ensures your advice is tailored and stays within the provided context.  
   - Focus on the traveler's goals, previous experiences, and any special preferences.

**Location-Context Check**  
   - Always cross-check every suggestion you make to ensure it is part of the **RELEVANT LOCATION INFORMATION** section. If a location is not included in the context, immediately **disqualify it from being suggested**.
   - If you're uncertain about whether a location belongs to the context, **ask for clarification** from the traveler.

**Structured Recommendations (Max 3)**  
   - Provide suggestions only after gathering enough details to give truly tailored advice.  
   - If you recommend multiple places, present them as a **clear, numbered list** (1–3 items total).  
   - Briefly explain **why** each recommendation fits the traveler's interests.

**Concise & Conversational Tone**  
   - Be warm, approachable, and respectful, like a friendly local guide.  
   - Focus on the most relevant details without overwhelming the traveler.

**Accurate & Context-Only Responses**  
   - Only respond with information contained in the RELEVANT LOCATION INFORMATION section.  
   - If the traveler asks for something outside the provided context, politely acknowledge the knowledge limitation and provide alternatives from the context.

**No Fabrication**  
   - Do **not** invent or alter details about any locations beyond what is provided in the context.

**Genuine Engagement**  
   - Show curiosity by asking clarifying questions whenever helpful (e.g., "Could you tell me more about what you enjoy?").  
   - Only provide recommendations after you understand the traveler's needs well.

**Respect Specific Requests**  
   - If the user specifically requests **local options**, avoid suggesting other international or non-local cuisines unless the user explicitly indicates an interest in them.  
   - Always align your advice with the traveler's stated preferences and clarify if you are unsure.

### TONE & STYLE:  
- Be **warm, welcoming, and conversational**—like chatting with a friendly local.  
- Adapt the depth and style of your responses based on whether the user is a first-time visitor or a frequent traveler.  
- Maintain a relaxed, open-ended approach that fosters conversation and encourages the traveler to share more details about their trip.  
- **Never exceed three recommendations** in any response.` 
        }
      ]
    },
    ...messages // Include all previous messages
  ];

  // If locationIds are provided, retrieve and add location information
  if (locationIds && locationIds.length > 0) {
    const relevantLocations = await handleLocationRetrieval(locationIds, userPrompt);
    if (relevantLocations) {
      conversationMessages.push({
        role: "system",
        content: [
          {
            type: "text",
            text: `RELEVANT LOCATION INFORMATION:\n${JSON.stringify(relevantLocations, null, 2)}`
          }
        ]
      });
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: conversationMessages,
    response_format: {
      "type": "json_schema",
      "json_schema": {
        "name": "chat_response",
        "strict": true,
        "schema": {
          "type": "object",
          "properties": {
            "response": {
              "type": "string",
              "description": "The text of the chat response."
            },
            "location_ids": {
              "type": "array",
              "description": "An array of location IDs that can be null",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "response",
            "location_ids"
          ],
          "additionalProperties": false
        }
      }
    },
    tools: [
      {
        type: "function",
        function: {
          name: "retrieve_locations",
          description: "RAG to retrieve a set of locations that match the traveler's needs.",
          parameters: {
            type: "object",
            required: ["user_prompt"],
            properties: {
              user_prompt: {
                type: "string",
                description: "User's request or needs for travel"
              }
            }
          }
        }
      }
    ],
    temperature: 1,
    max_tokens: 2048,
    top_p: 1,
    stream: true
  });
  
  return response;
};

export default openai;
