import { tool } from "ai";
import { z } from "zod";

// Weather tool - fetches real-time weather data
export const getWeather = tool({
  description: "Get current weather information for a specific location. Use this when users ask about weather, temperature, or climate conditions.",
  parameters: z.object({
    location: z.string().describe("City name or location"),
  }).describe("Weather parameters"),
  execute: async ({ location }) => {
    try {
      // Using OpenWeatherMap API (free tier)
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        return {
          error: "Weather API key not configured",
          location,
        };
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        return {
          error: `Weather data not found for ${location}`,
          location,
        };
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
      return {
        error: `Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        location,
      };
    }
  },
});

// Calculator tool - performs mathematical calculations
export const calculate = tool({
  description: "Perform mathematical calculations. Use this for arithmetic operations like addition, subtraction, multiplication, division, and basic math expressions.",
  parameters: z.object({
    expression: z.string().describe("Mathematical expression to evaluate"),
  }).describe("Calculator parameters"),
  execute: async ({ expression }) => {
    try {
      // Safe evaluation - only allow numbers and basic operators
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

      if (sanitized !== expression) {
        return {
          error: "Invalid expression. Only numbers and basic operators (+, -, *, /, parentheses) are allowed.",
          expression,
        };
      }

      // Use Function constructor for safe evaluation
      const result = Function(`"use strict"; return (${sanitized})`)();

      return {
        expression: expression,
        result: result,
      };
    } catch (error) {
      return {
        error: `Failed to calculate: ${error instanceof Error ? error.message : 'Invalid expression'}`,
        expression,
      };
    }
  },
});

// Time tool - gets current time in different timezones
export const getTime = tool({
  description: "Get current time and date information for any timezone or location. Use this when users ask about current time, date, or time in different locations.",
  parameters: z.object({
    timezone: z.string().describe("Timezone or city name"),
  }).describe("Time parameters"),
  execute: async ({ timezone }) => {
    try {
      const now = new Date();

      // Try to format with the timezone
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone.includes('/') ? timezone : undefined,
        dateStyle: 'full',
        timeStyle: 'long',
      }).format(now);

      return {
        timezone,
        datetime: formatted,
        timestamp: now.toISOString(),
      };
    } catch (error) {
      return {
        error: `Invalid timezone: ${timezone}`,
        timezone,
      };
    }
  },
});

// Export all tools as a collection
export const tools = {
  getWeather,
  calculate,
  getTime,
};