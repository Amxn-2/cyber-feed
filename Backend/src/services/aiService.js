// src/services/geminiService.js
const Groq = require('groq-sdk');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.modelName = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    this.cache = new Map();
    this.cacheTimeout = parseInt(process.env.GROQ_CACHE_TIMEOUT) || 300000;
    
    if (!this.apiKey) {
      logger.warn('GROQ_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.groq = new Groq({
        apiKey: this.apiKey,
      });
      logger.info(`Groq AI service initialized successfully with model: ${this.modelName}`);
    } catch (error) {
      logger.error('Failed to initialize Groq AI service:', error);
    }
  }

  async analyzeIncident(incident) {
    if (!this.groq) throw new Error('AI service not initialized');

    const cacheKey = `incident_v1_${incident._id}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `
        Analyze the following cyber security incident from India and provide structured insights in JSON format:
        
        Title: ${incident.title}
        Description: ${incident.description || 'N/A'}
        Source: ${incident.source}
        Category: ${incident.category}
        Severity: ${incident.severity}
        
        Return exactly this JSON structure:
        {
          "riskAssessment": "string",
          "affectedSectors": "string",
          "recommendedActions": "string",
          "threatLevel": "Low/Medium/High/Critical",
          "keyInsights": "string",
          "fullAnalysis": "string"
        }
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.modelName,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(chatCompletion.choices[0].message.content);
      response.timestamp = new Date().toISOString();
      
      this.setCachedResult(cacheKey, response);
      return response;
    } catch (error) {
      logger.error('Groq analysis failed:', error);
      throw error;
    }
  }

  async generateThreatSummary(incidents) {
    if (!this.groq) throw new Error('AI service not initialized');

    try {
      const incidentList = incidents.slice(0, 10).map(i => `- ${i.title} (${i.severity})`).join('\n');
      const prompt = `
        Provide a cybersecurity threat landscape summary for India based on these incidents:
        ${incidentList}
        
        Return exactly this JSON structure:
        {
          "threatLandscape": "string",
          "trendingThreats": "string",
          "sectorAnalysis": "string",
          "recommendations": "string",
          "futureOutlook": "string",
          "fullSummary": "string"
        }
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.modelName,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(chatCompletion.choices[0].message.content);
      response.timestamp = new Date().toISOString();
      response.incidentCount = incidents.length;
      
      return response;
    } catch (error) {
      logger.error('Groq summary failed:', error);
      throw error;
    }
  }

  async generateIncidentInsights(data) {
    // Basic wrapper to match existing API expected by dashboard
    return this.generateThreatSummary(data.recentIncidents || []);
  }

  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data;
    return null;
  }

  setCachedResult(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  isAvailable() {
    return !!this.groq && !!this.apiKey;
  }

  getServiceInfo() {
    return {
      available: this.isAvailable(),
      model: this.modelName,
      service: 'Groq AI'
    };
  }
}

module.exports = new AIService();