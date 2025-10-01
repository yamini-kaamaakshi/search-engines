// AI-powered search with tool calling
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareVectorStore } from "@/lib/cloudflareVectorStore";

// Simple tool functions
async function callWeatherAPI(location: string) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return { error: "Weather API key not configured" };
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return { error: `Weather data not found for ${location}` };
    }

    const data = await response.json();
    return {
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      wind_speed: data.wind.speed,
    };
  } catch (error) {
    return { error: `Failed to fetch weather: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

function calculateExpression(expression: string) {
  try {
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    if (sanitized !== expression) {
      return { error: "Invalid expression" };
    }
    const result = Function(`"use strict"; return (${sanitized})`)();
    return { expression, result };
  } catch (error) {
    return { error: "Failed to calculate" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const lowerQuery = query.toLowerCase();

    // Check for calculator queries
    const mathPattern = /(?:calculate|what'?s|what is)\s*([\d\+\-\*\/\(\)\s]+)/i;
    const mathMatch = query.match(mathPattern);

    if (mathMatch || /^[\d\+\-\*\/\(\)\s]+$/.test(query)) {
      const expression = mathMatch ? mathMatch[1].trim() : query.trim();
      const result = calculateExpression(expression);

      if (result.error) {
        return NextResponse.json({
          success: true,
          answer: `Error: ${result.error}`,
          query,
          sources: [],
          usedTools: true,
        });
      }

      return NextResponse.json({
        success: true,
        answer: `The result of ${result.expression} is **${result.result}**`,
        query,
        sources: [],
        usedTools: true,
      });
    }

    // Check for weather queries
    if (lowerQuery.includes('weather') || lowerQuery.includes('temperature')) {
      const locationMatch = query.match(/(?:in|for|at)\s+([a-zA-Z\s]+)/i);
      let location = locationMatch ? locationMatch[1].trim() : 'London';

      // Handle common country abbreviations
      const countryMap: Record<string, string> = {
        'uk': 'London',
        'usa': 'New York',
        'us': 'New York',
        'india': 'Delhi',
        'japan': 'Tokyo',
        'china': 'Beijing',
        'france': 'Paris',
        'germany': 'Berlin',
        'canada': 'Toronto',
        'australia': 'Sydney',
      };

      if (countryMap[location.toLowerCase()]) {
        location = countryMap[location.toLowerCase()];
      }

      const weatherData = await callWeatherAPI(location);

      if (weatherData.error) {
        return NextResponse.json({
          success: true,
          answer: `Error: ${weatherData.error}`,
          query,
          sources: [],
          usedTools: true,
        });
      }

      const answer = `**Weather in ${weatherData.location}, ${weatherData.country}:**
- Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feels_like}°C)
- Conditions: ${weatherData.description}
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.wind_speed} m/s`;

      return NextResponse.json({
        success: true,
        answer,
        query,
        sources: [],
        usedTools: true,
      });
    }

    // Default to document search
    const vectorStore = await getCloudflareVectorStore();
    const result = await vectorStore.search(query, 3);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Search failed",
          details: result.error || "Unknown error"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...result,
      usedTools: false,
    });

  } catch (error) {
    console.error("❌ Search error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}