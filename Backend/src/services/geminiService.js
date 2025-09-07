// src/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      logger.warn('GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      logger.info('Gemini AI service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Gemini AI service:', error);
    }
  }

  async analyzeIncident(incident) {
    if (!this.model) {
      throw new Error('Gemini AI service not initialized');
    }

    try {
      const prompt = `
        Analyze the following cyber security incident from India and provide insights:
        
        Title: ${incident.title}
        Description: ${incident.description || 'No description available'}
        Source: ${incident.source}
        Category: ${incident.category}
        Severity: ${incident.severity}
        Published Date: ${incident.published_date}
        
        Please provide:
        1. Risk Assessment: Evaluate the potential impact on Indian organizations
        2. Affected Sectors: Which sectors in India are most likely to be affected
        3. Recommended Actions: Specific steps Indian organizations should take
        4. Threat Level: Assess the overall threat level for India (Low/Medium/High/Critical)
        5. Key Insights: Important takeaways for Indian cybersecurity professionals
        
        Format your response as a structured analysis focusing on the Indian context.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      return {
        riskAssessment: this.extractSection(analysis, 'Risk Assessment'),
        affectedSectors: this.extractSection(analysis, 'Affected Sectors'),
        recommendedActions: this.extractSection(analysis, 'Recommended Actions'),
        threatLevel: this.extractSection(analysis, 'Threat Level'),
        keyInsights: this.extractSection(analysis, 'Key Insights'),
        fullAnalysis: analysis
      };
    } catch (error) {
      logger.error('Failed to analyze incident with Gemini:', error);
      throw error;
    }
  }

  async generateThreatSummary(incidents) {
    if (!this.model) {
      throw new Error('Gemini AI service not initialized');
    }

    try {
      const incidentSummary = incidents.slice(0, 10).map(incident => 
        `- ${incident.title} (${incident.severity}) - ${incident.source}`
      ).join('\n');

      const prompt = `
        Based on the following recent cyber security incidents in India, provide a comprehensive threat summary:
        
        Recent Incidents:
        ${incidentSummary}
        
        Please provide:
        1. Overall Threat Landscape: Current state of cybersecurity in India
        2. Trending Threats: Most common attack vectors and patterns
        3. Sector Analysis: Which sectors are most targeted
        4. Recommendations: Strategic recommendations for Indian organizations
        5. Future Outlook: Predicted trends for the next 30 days
        
        Focus on actionable insights for Indian cybersecurity professionals and organizations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return {
        threatLandscape: this.extractSection(summary, 'Overall Threat Landscape'),
        trendingThreats: this.extractSection(summary, 'Trending Threats'),
        sectorAnalysis: this.extractSection(summary, 'Sector Analysis'),
        recommendations: this.extractSection(summary, 'Recommendations'),
        futureOutlook: this.extractSection(summary, 'Future Outlook'),
        fullSummary: summary
      };
    } catch (error) {
      logger.error('Failed to generate threat summary with Gemini:', error);
      throw error;
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

  isAvailable() {
    return !!this.model;
  }
}

module.exports = new GeminiService();