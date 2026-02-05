/**
 * Claude API Integration Hook
 * Provides AI-powered features for trip planning
 */

import { useState, useCallback } from 'react';

// Check if Claude API is available (window.claude)
const hasClaudeAPI = () => typeof window !== 'undefined' && window.claude;

/**
 * Custom hook for Claude AI integration
 */
export function useClaude() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Send a message to Claude
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Claude's response
   */
  const sendMessage = useCallback(async (prompt, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      if (hasClaudeAPI()) {
        const response = await window.claude.sendMessage(prompt, options);
        return response;
      } else {
        // Fallback for development/testing without Claude API
        console.log('Claude API not available, using mock response');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getMockResponse(prompt);
      }
    } catch (err) {
      console.error('Claude API error:', err);
      setError(err.message || 'Failed to get response from Claude');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get itinerary suggestions for a destination
   */
  const getItinerarySuggestions = useCallback(async (destination, duration, interests = []) => {
    const prompt = `You are a travel planning assistant. Suggest a ${duration}-day itinerary for ${destination}.
${interests.length > 0 ? `The travelers are interested in: ${interests.join(', ')}.` : ''}

Please provide:
1. A day-by-day breakdown of activities
2. Best times to visit each attraction
3. Estimated duration for each activity
4. Local tips and recommendations

Format the response as a structured list of events with:
- title: Activity name
- description: Brief description
- category: Type (meal, activity, sightseeing, etc.)
- suggestedTime: Best time of day
- duration: Estimated duration
- location: Specific location or area`;

    const response = await sendMessage(prompt);
    return parseItinerarySuggestions(response);
  }, [sendMessage]);

  /**
   * Parse natural language travel details
   */
  const parseTravelDetails = useCallback(async (naturalInput) => {
    const prompt = `Parse the following travel information and extract structured data:

"${naturalInput}"

Extract and return JSON with these fields (use null for missing info):
{
  "type": "flight" | "drive" | "accommodation",
  "flight": {
    "airline": string,
    "flightNumber": string,
    "departureAirport": string (3-letter code),
    "arrivalAirport": string (3-letter code),
    "departureTime": ISO datetime string,
    "arrivalTime": ISO datetime string
  },
  "drive": {
    "departureLocation": string,
    "arrivalLocation": string,
    "departureTime": ISO datetime string,
    "estimatedArrival": ISO datetime string,
    "vehicleInfo": string
  },
  "accommodation": {
    "hotelName": string,
    "address": string,
    "checkIn": ISO date string,
    "checkOut": ISO date string,
    "confirmationNumber": string
  }
}

Only include the relevant type's data. Return valid JSON only.`;

    const response = await sendMessage(prompt);
    return parseTravelJSON(response);
  }, [sendMessage]);

  /**
   * Detect scheduling conflicts
   */
  const detectConflicts = useCallback(async (events, newEvent) => {
    const eventsStr = events.map(e =>
      `- ${e.title}: ${e.datetime} (${e.duration || '1 hour'})`
    ).join('\n');

    const prompt = `Analyze the following schedule for conflicts with a new event:

Existing events:
${eventsStr}

New event to add:
- ${newEvent.title}: ${newEvent.datetime} (${newEvent.duration || '1 hour'})

Check for:
1. Time overlaps
2. Insufficient travel time between locations
3. Unrealistic scheduling (too many activities)

Return JSON:
{
  "hasConflict": boolean,
  "conflicts": [
    {
      "type": "overlap" | "travel_time" | "overbooked",
      "description": string,
      "suggestion": string
    }
  ]
}`;

    const response = await sendMessage(prompt);
    return parseTravelJSON(response);
  }, [sendMessage]);

  /**
   * Calculate travel time between locations
   */
  const calculateTravelTime = useCallback(async (origin, destination, mode = 'driving') => {
    const prompt = `Estimate travel time from "${origin}" to "${destination}" by ${mode}.

Return JSON:
{
  "estimatedMinutes": number,
  "distance": string,
  "mode": string,
  "notes": string (any relevant travel tips)
}`;

    const response = await sendMessage(prompt);
    return parseTravelJSON(response);
  }, [sendMessage]);

  /**
   * Chat with trip planning assistant
   */
  const chatWithAssistant = useCallback(async (message, context = {}) => {
    const contextStr = context.destination
      ? `Context: Planning a trip to ${context.destination}${context.dates ? ` from ${context.dates}` : ''}.`
      : '';

    const prompt = `You are a friendly travel planning assistant helping with a group trip.
${contextStr}

User message: ${message}

Provide helpful, concise travel advice. If asked about specific activities or places, include practical details like hours, costs, and tips.`;

    return sendMessage(prompt);
  }, [sendMessage]);

  /**
   * Generate packing suggestions
   */
  const getPackingSuggestions = useCallback(async (destination, duration, activities = []) => {
    const prompt = `Generate a packing list for a ${duration}-day trip to ${destination}.
${activities.length > 0 ? `Planned activities include: ${activities.join(', ')}.` : ''}

Return JSON:
{
  "essentials": [string],
  "clothing": [string],
  "toiletries": [string],
  "electronics": [string],
  "activitySpecific": [string],
  "tips": [string]
}`;

    const response = await sendMessage(prompt);
    return parseTravelJSON(response);
  }, [sendMessage]);

  /**
   * Get local recommendations
   */
  const getLocalRecommendations = useCallback(async (location, category, preferences = {}) => {
    const prompt = `Recommend ${category} in/near ${location}.
${preferences.budget ? `Budget: ${preferences.budget}` : ''}
${preferences.dietary ? `Dietary restrictions: ${preferences.dietary}` : ''}

Return JSON array of up to 5 recommendations:
[
  {
    "name": string,
    "category": string,
    "description": string,
    "priceRange": "$" | "$$" | "$$$" | "$$$$",
    "rating": number (1-5),
    "tip": string
  }
]`;

    const response = await sendMessage(prompt);
    return parseTravelJSON(response);
  }, [sendMessage]);

  return {
    loading,
    error,
    sendMessage,
    getItinerarySuggestions,
    parseTravelDetails,
    detectConflicts,
    calculateTravelTime,
    chatWithAssistant,
    getPackingSuggestions,
    getLocalRecommendations,
    isAvailable: hasClaudeAPI(),
  };
}

/**
 * Parse itinerary suggestions from Claude response
 */
function parseItinerarySuggestions(response) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: parse text response into structured format
    const lines = response.split('\n').filter(line => line.trim());
    const events = [];
    let currentDay = 0;

    lines.forEach(line => {
      const dayMatch = line.match(/day\s*(\d+)/i);
      if (dayMatch) {
        currentDay = parseInt(dayMatch[1]);
      }

      // Simple parsing for activity lines
      if (line.includes(':') && !line.toLowerCase().includes('day')) {
        const [time, ...rest] = line.split(':');
        const title = rest.join(':').trim();
        if (title) {
          events.push({
            title,
            day: currentDay,
            suggestedTime: time.trim(),
            category: 'activity',
          });
        }
      }
    });

    return events;
  } catch (err) {
    console.error('Failed to parse itinerary suggestions:', err);
    return [];
  }
}

/**
 * Parse JSON from Claude response
 */
function parseTravelJSON(response) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (err) {
    console.error('Failed to parse JSON response:', err);
    return null;
  }
}

/**
 * Mock responses for development without Claude API
 */
function getMockResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('itinerary') || lowerPrompt.includes('suggest')) {
    return JSON.stringify([
      {
        title: 'Morning coffee at local café',
        description: 'Start your day with local coffee and pastries',
        category: 'meal',
        suggestedTime: '8:00 AM',
        duration: '1 hour',
        location: 'City Center',
      },
      {
        title: 'Visit main attraction',
        description: 'Explore the most popular landmark',
        category: 'sightseeing',
        suggestedTime: '10:00 AM',
        duration: '2 hours',
        location: 'Historic District',
      },
      {
        title: 'Lunch at recommended restaurant',
        description: 'Try local cuisine',
        category: 'meal',
        suggestedTime: '12:30 PM',
        duration: '1.5 hours',
        location: 'Downtown',
      },
    ]);
  }

  if (lowerPrompt.includes('parse') || lowerPrompt.includes('extract')) {
    return JSON.stringify({
      type: 'flight',
      flight: {
        airline: 'Sample Airlines',
        flightNumber: 'SA123',
        departureAirport: 'JFK',
        arrivalAirport: 'LAX',
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      },
    });
  }

  if (lowerPrompt.includes('conflict')) {
    return JSON.stringify({
      hasConflict: false,
      conflicts: [],
    });
  }

  if (lowerPrompt.includes('travel time') || lowerPrompt.includes('estimate')) {
    return JSON.stringify({
      estimatedMinutes: 30,
      distance: '15 miles',
      mode: 'driving',
      notes: 'Traffic may vary during rush hour',
    });
  }

  if (lowerPrompt.includes('packing')) {
    return JSON.stringify({
      essentials: ['Passport', 'Phone charger', 'Wallet', 'Travel documents'],
      clothing: ['Comfortable walking shoes', 'Weather-appropriate clothes', 'Light jacket'],
      toiletries: ['Toothbrush', 'Sunscreen', 'Basic medications'],
      electronics: ['Phone', 'Camera', 'Power adapter'],
      activitySpecific: ['Swimsuit', 'Hiking gear'],
      tips: ['Roll clothes to save space', 'Keep essentials in carry-on'],
    });
  }

  if (lowerPrompt.includes('recommend')) {
    return JSON.stringify([
      {
        name: 'Popular Local Spot',
        category: 'Restaurant',
        description: 'Known for authentic local cuisine',
        priceRange: '$$',
        rating: 4.5,
        tip: 'Make reservations for dinner',
      },
    ]);
  }

  // Default response
  return "I'd be happy to help with your trip planning! Could you provide more details about what you'd like to know?";
}

export default useClaude;
