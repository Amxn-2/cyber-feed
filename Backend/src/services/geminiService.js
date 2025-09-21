// src/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES) || 3;
    this.timeout = parseInt(process.env.GEMINI_TIMEOUT) || 30000;
    this.cache = new Map();
    this.cacheTimeout = parseInt(process.env.GEMINI_CACHE_TIMEOUT) || 300000; // 5 minutes
    this.rateLimitDelay = parseInt(process.env.GEMINI_RATE_LIMIT_DELAY) || 1000; // 1 second
    this.lastRequestTime = 0;
    
    if (!this.apiKey) {
      logger.warn('GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: this.modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });
      logger.info(`Gemini AI service initialized successfully with model: ${this.modelName}`);
    } catch (error) {
      logger.error('Failed to initialize Gemini AI service:', error);
    }
  }

  async analyzeIncident(incident) {
    if (!this.model) {
      throw new Error('Gemini AI service not initialized');
    }

    // Generate cache key
    const cacheKey = `incident_${incident._id}_${incident.updatedAt || incident.createdAt}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      logger.info(`Returning cached analysis for incident: ${incident._id}`);
      return cached;
    }

    try {
      // Validate input
      this.validateIncidentInput(incident);

      const prompt = this.buildIncidentAnalysisPrompt(incident);
      
      // Rate limiting
      await this.enforceRateLimit();

      const result = await this.executeWithRetry(async () => {
        return await this.model.generateContent(prompt);
      });

      const response = await result.response;
      const analysis = response.text();

      const processedAnalysis = {
        riskAssessment: this.extractSection(analysis, 'Risk Assessment'),
        affectedSectors: this.extractSection(analysis, 'Affected Sectors'),
        recommendedActions: this.extractSection(analysis, 'Recommended Actions'),
        threatLevel: this.extractSection(analysis, 'Threat Level'),
        keyInsights: this.extractSection(analysis, 'Key Insights'),
        fullAnalysis: analysis,
        confidence: this.calculateConfidence(analysis),
        timestamp: new Date().toISOString()
      };

      // Cache the result
      this.setCachedResult(cacheKey, processedAnalysis);

      logger.info(`Successfully analyzed incident: ${incident._id}`);
      return processedAnalysis;
    } catch (error) {
      logger.error('Failed to analyze incident with Gemini:', error);
      throw this.handleGeminiError(error);
    }
  }

  async generateThreatSummary(incidents) {
    if (!this.model) {
      throw new Error('Gemini AI service not initialized');
    }

    // Generate cache key based on incidents
    const incidentIds = incidents.slice(0, 10).map(i => i._id).sort().join(',');
    const cacheKey = `threat_summary_${incidentIds}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      logger.info('Returning cached threat summary');
      return cached;
    }

    try {
      // Validate input
      if (!Array.isArray(incidents) || incidents.length === 0) {
        throw new Error('No incidents provided for analysis');
      }

      const incidentSummary = incidents.slice(0, 10).map(incident => 
        `- ${incident.title} (${incident.severity}) - ${incident.source}`
      ).join('\n');

      const prompt = this.buildThreatSummaryPrompt(incidentSummary);
      
      // Rate limiting
      await this.enforceRateLimit();

      const result = await this.executeWithRetry(async () => {
        return await this.model.generateContent(prompt);
      });

      const response = await result.response;
      const summary = response.text();

      const processedSummary = {
        threatLandscape: this.extractSection(summary, 'Overall Threat Landscape'),
        trendingThreats: this.extractSection(summary, 'Trending Threats'),
        sectorAnalysis: this.extractSection(summary, 'Sector Analysis'),
        recommendations: this.extractSection(summary, 'Recommendations'),
        futureOutlook: this.extractSection(summary, 'Future Outlook'),
        fullSummary: summary,
        incidentCount: incidents.length,
        confidence: this.calculateConfidence(summary),
        timestamp: new Date().toISOString()
      };

      // Cache the result
      this.setCachedResult(cacheKey, processedSummary);

      logger.info(`Successfully generated threat summary for ${incidents.length} incidents`);
      return processedSummary;
    } catch (error) {
      logger.error('Failed to generate threat summary with Gemini:', error);
      throw this.handleGeminiError(error);
    }
  }

  async generateIncidentInsights(incidentData) {
    if (!this.model) {
      throw new Error('Gemini AI service not initialized');
    }

    try {
      const prompt = `
        Analyze this cyber security incident data from India and provide AI-powered insights:
        
        Incident Data:
        ${JSON.stringify(incidentData, null, 2)}
        
        Provide:
        1. Pattern Analysis: Identify patterns and trends
        2. Risk Correlation: How this relates to other threats
        3. Impact Prediction: Potential future impact
        4. Mitigation Strategies: Specific recommendations
        5. Intelligence Summary: Key intelligence for Indian cybersecurity teams
        
        Focus on actionable intelligence for Indian organizations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();

      return {
        patternAnalysis: this.extractSection(insights, 'Pattern Analysis'),
        riskCorrelation: this.extractSection(insights, 'Risk Correlation'),
        impactPrediction: this.extractSection(insights, 'Impact Prediction'),
        mitigationStrategies: this.extractSection(insights, 'Mitigation Strategies'),
        intelligenceSummary: this.extractSection(insights, 'Intelligence Summary'),
        fullInsights: insights
      };
    } catch (error) {
      logger.error('Failed to generate incident insights with Gemini:', error);
      throw error;
    }
  }

  extractSection(text, sectionName) {
    try {
      const regex = new RegExp(`${sectionName}[:\\s]*(.*?)(?=\\n\\d+\\.|\\n[A-Z][a-z]+:|$)`, 's');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    } catch (error) {
      logger.error(`Failed to extract section ${sectionName}:`, error);
      return '';
    }
  }

  // Helper methods for production-grade functionality
  validateIncidentInput(incident) {
    if (!incident || !incident._id || !incident.title) {
      throw new Error('Invalid incident data provided');
    }
    
    if (typeof incident.title !== 'string' || incident.title.length > 1000) {
      throw new Error('Invalid incident title');
    }
    
    if (incident.description && incident.description.length > 5000) {
      throw new Error('Incident description too long');
    }
  }

  buildIncidentAnalysisPrompt(incident) {
    return `
      Analyze the following cyber security incident from India and provide comprehensive insights:
      
      Title: ${incident.title}
      Description: ${incident.description || 'No description available'}
      Source: ${incident.source}
      Category: ${incident.category}
      Severity: ${incident.severity}
      Published Date: ${incident.published_date}
      Location: ${incident.location || 'India'}
      
      Please provide a structured analysis with the following sections:
      
      1. Risk Assessment: Evaluate the potential impact on Indian organizations, considering the specific threat type and target sectors.
      
      2. Affected Sectors: Identify which sectors in India are most likely to be affected, including government, financial, healthcare, education, and critical infrastructure.
      
      3. Recommended Actions: Provide specific, actionable steps that Indian organizations should take to protect themselves from this threat.
      
      4. Threat Level: Assess the overall threat level for India using a scale of Low/Medium/High/Critical, with justification.
      
      5. Key Insights: Highlight the most important takeaways for Indian cybersecurity professionals, including any unique aspects of this threat.
      
      Focus on actionable intelligence and practical recommendations for Indian organizations. Keep responses concise but comprehensive.
    `;
  }

  buildThreatSummaryPrompt(incidentSummary) {
    return `
      Based on the following recent cyber security incidents in India, provide a comprehensive threat summary:
      
      Recent Incidents:
      ${incidentSummary}
      
      Please provide a structured analysis with the following sections:
      
      1. Overall Threat Landscape: Current state of cybersecurity in India, including emerging trends and threat actors.
      
      2. Trending Threats: Most common attack vectors, patterns, and techniques observed in recent incidents.
      
      3. Sector Analysis: Which sectors are most targeted and why, including government, financial, healthcare, education, and critical infrastructure.
      
      4. Recommendations: Strategic recommendations for Indian organizations to improve their cybersecurity posture.
      
      5. Future Outlook: Predicted trends and threats for the next 30 days, including potential new attack vectors.
      
      Focus on actionable insights for Indian cybersecurity professionals and organizations. Provide specific, practical recommendations that can be implemented immediately.
    `;
  }

  async executeWithRetry(operation) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await Promise.race([
          operation(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.timeout)
          )
        ]);
      } catch (error) {
        lastError = error;
        logger.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  calculateConfidence(analysis) {
    // Simple confidence calculation based on analysis completeness
    const sections = ['Risk Assessment', 'Affected Sectors', 'Recommended Actions', 'Threat Level', 'Key Insights'];
    let completedSections = 0;
    
    sections.forEach(section => {
      if (this.extractSection(analysis, section).length > 50) {
        completedSections++;
      }
    });
    
    return Math.round((completedSections / sections.length) * 100);
  }

  handleGeminiError(error) {
    if (error.message.includes('quota')) {
      return new Error('AI service quota exceeded. Please try again later.');
    } else if (error.message.includes('permission')) {
      return new Error('AI service permission denied. Please check API key configuration.');
    } else if (error.message.includes('timeout')) {
      return new Error('AI service request timed out. Please try again.');
    } else if (error.message.includes('safety')) {
      return new Error('Content blocked by safety filters. Please try with different input.');
    } else {
      return new Error(`AI analysis failed: ${error.message}`);
    }
  }

  isAvailable() {
    return !!this.model && !!this.apiKey;
  }

  getServiceInfo() {
    return {
      available: this.isAvailable(),
      model: this.modelName,
      cacheSize: this.cache.size,
      lastRequestTime: this.lastRequestTime,
      configuration: {
        maxRetries: this.maxRetries,
        timeout: this.timeout,
        cacheTimeout: this.cacheTimeout,
        rateLimitDelay: this.rateLimitDelay
      }
    };
  }
}

module.exports = new GeminiService();