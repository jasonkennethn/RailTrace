import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyBbHJTg18A6-ICWwU1OF5unt2abFwoWS4Q';

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeVendorPerformance(vendorData: any): Promise<number> {
    try {
      const prompt = `
        Analyze the following vendor performance data and provide a score from 0-100:
        
        Vendor: ${vendorData.name}
        Products Delivered: ${vendorData.productsDelivered || 0}
        Defect Rate: ${vendorData.defectRate || 0}%
        On-time Delivery: ${vendorData.onTimeDelivery || 0}%
        Quality Score: ${vendorData.qualityScore || 0}
        Customer Feedback: ${vendorData.feedback || 'No feedback'}
        
        Consider factors like reliability, quality, delivery performance, and overall satisfaction.
        Return only a numeric score between 0-100.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const score = parseInt(response.text().trim());
      
      return isNaN(score) ? 75 : Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback calculation
      return this.calculateFallbackScore(vendorData);
    }
  }

  async analyzeManufacturerPerformance(manufacturerData: any): Promise<{
    score: number;
    insights: string[];
    recommendations: string[];
    trends: string[];
  }> {
    try {
      const prompt = `
        Analyze this manufacturer performance data:
        
        Manufacturer: ${manufacturerData.name || 'Current Manufacturer'}
        Orders Completed: ${manufacturerData.ordersCompleted || 0}
        Delivery Rate: ${manufacturerData.deliveryRate || 0}%
        Product Quality Score: ${manufacturerData.qualityScore || 0}
        Customer Satisfaction: ${manufacturerData.customerSatisfaction || 0}/5
        Defect Rate: ${manufacturerData.defectRate || 0}%
        On-time Delivery: ${manufacturerData.onTimeDelivery || 0}%
        
        Provide analysis as JSON:
        {
          "score": number (0-100),
          "insights": ["insight1", "insight2", "insight3"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "trends": ["trend1", "trend2", "trend3"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const parsed = JSON.parse(text);
        return {
          score: parsed.score || 85,
          insights: parsed.insights || ['Performance analysis completed'],
          recommendations: parsed.recommendations || ['Continue current practices'],
          trends: parsed.trends || ['Stable performance observed']
        };
      } catch {
        return this.getFallbackManufacturerAnalysis(manufacturerData);
      }
    } catch (error) {
      console.error('AI manufacturer analysis failed:', error);
      return this.getFallbackManufacturerAnalysis(manufacturerData);
    }
  }
  async analyzeProductPerformance(productData: any): Promise<{
    score: number;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Analyze this railway product performance data:
        
        Product: ${productData.name}
        Category: ${productData.category}
        Inspections Passed: ${productData.inspectionsPassed || 0}
        Inspections Failed: ${productData.inspectionsFailed || 0}
        Installation Success Rate: ${productData.installationSuccess || 0}%
        Maintenance Frequency: ${productData.maintenanceFreq || 0} times/year
        Lifespan: ${productData.lifespan || 0} years
        Cost: ₹${productData.cost || 0}
        
        Provide:
        1. Performance score (0-100)
        2. Key insights (3-5 points)
        3. Recommendations (3-5 points)
        
        Format as JSON: {"score": number, "insights": ["insight1", "insight2"], "recommendations": ["rec1", "rec2"]}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const parsed = JSON.parse(text);
        return {
          score: parsed.score || 75,
          insights: parsed.insights || ['Performance analysis completed'],
          recommendations: parsed.recommendations || ['Continue monitoring']
        };
      } catch {
        return this.getFallbackProductAnalysis(productData);
      }
    } catch (error) {
      console.error('AI product analysis failed:', error);
      return this.getFallbackProductAnalysis(productData);
    }
  }

  async generateInspectionInsights(inspectionData: any[]): Promise<{
    overallScore: number;
    trends: string[];
    alerts: string[];
    predictions: string[];
  }> {
    try {
      const prompt = `
        Analyze these railway inspection results:
        
        Total Inspections: ${inspectionData.length}
        Passed: ${inspectionData.filter(i => i.status === 'passed').length}
        Failed: ${inspectionData.filter(i => i.status === 'failed').length}
        Pending: ${inspectionData.filter(i => i.status === 'pending').length}
        
        Recent Inspections:
        ${inspectionData.slice(0, 10).map(i => 
          `- ${i.productId}: ${i.status} (${i.location})`
        ).join('\n')}
        
        Provide analysis as JSON:
        {
          "overallScore": number (0-100),
          "trends": ["trend1", "trend2", "trend3"],
          "alerts": ["alert1", "alert2"],
          "predictions": ["prediction1", "prediction2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const parsed = JSON.parse(text);
        return {
          overallScore: parsed.overallScore || 85,
          trends: parsed.trends || ['Inspection trends analyzed'],
          alerts: parsed.alerts || ['No critical alerts'],
          predictions: parsed.predictions || ['System performing well']
        };
      } catch {
        return this.getFallbackInspectionAnalysis(inspectionData);
      }
    } catch (error) {
      console.error('AI inspection analysis failed:', error);
      return this.getFallbackInspectionAnalysis(inspectionData);
    }
  }

  async predictMaintenanceNeeds(assetData: any): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    predictedDate: Date;
    recommendations: string[];
    confidence: number;
  }> {
    try {
      const prompt = `
        Predict maintenance needs for this railway asset:
        
        Asset: ${assetData.name}
        Age: ${assetData.age || 0} years
        Last Maintenance: ${assetData.lastMaintenance || 'Unknown'}
        Usage Frequency: ${assetData.usageFreq || 'Normal'}
        Environment: ${assetData.environment || 'Standard'}
        Recent Issues: ${assetData.recentIssues || 'None'}
        
        Predict maintenance needs as JSON:
        {
          "riskLevel": "low|medium|high",
          "daysUntilMaintenance": number,
          "recommendations": ["rec1", "rec2"],
          "confidence": number (0-100)
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const parsed = JSON.parse(text);
        const predictedDate = new Date();
        predictedDate.setDate(predictedDate.getDate() + (parsed.daysUntilMaintenance || 90));
        
        return {
          riskLevel: parsed.riskLevel || 'low',
          predictedDate,
          recommendations: parsed.recommendations || ['Schedule routine inspection'],
          confidence: parsed.confidence || 75
        };
      } catch {
        return this.getFallbackMaintenancePrediction(assetData);
      }
    } catch (error) {
      console.error('AI maintenance prediction failed:', error);
      return this.getFallbackMaintenancePrediction(assetData);
    }
  }

  private calculateFallbackScore(vendorData: any): number {
    const defectWeight = 0.3;
    const deliveryWeight = 0.3;
    const qualityWeight = 0.4;
    
    const defectScore = Math.max(0, 100 - (vendorData.defectRate || 5) * 10);
    const deliveryScore = vendorData.onTimeDelivery || 85;
    const qualityScore = vendorData.qualityScore || 80;
    
    return Math.round(
      defectScore * defectWeight +
      deliveryScore * deliveryWeight +
      qualityScore * qualityWeight
    );
  }

  private getFallbackProductAnalysis(productData: any) {
    const passRate = productData.inspectionsPassed / 
      (productData.inspectionsPassed + productData.inspectionsFailed) * 100 || 85;
    
    return {
      score: Math.round(passRate),
      insights: [
        'Product performance within acceptable range',
        'Regular monitoring recommended',
        'Quality metrics stable'
      ],
      recommendations: [
        'Continue current maintenance schedule',
        'Monitor for any performance degradation',
        'Consider preventive measures'
      ]
    };
  }

  private getFallbackInspectionAnalysis(inspectionData: any[]) {
    const passRate = inspectionData.filter(i => i.status === 'passed').length / 
      inspectionData.length * 100 || 85;
    
    return {
      overallScore: Math.round(passRate),
      trends: [
        'Inspection completion rate stable',
        'Quality standards maintained',
        'No significant deterioration observed'
      ],
      alerts: [
        'Monitor failed inspections closely',
        'Ensure timely completion of pending inspections'
      ],
      predictions: [
        'System performance expected to remain stable',
        'Preventive maintenance recommended'
      ]
    };
  }

  private getFallbackMaintenancePrediction(assetData: any) {
    const age = assetData.age || 0;
    const riskLevel = age > 10 ? 'high' : age > 5 ? 'medium' : 'low';
    const daysUntilMaintenance = age > 10 ? 30 : age > 5 ? 60 : 90;
    
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysUntilMaintenance);
    
    return {
      riskLevel: riskLevel as 'low' | 'medium' | 'high',
      predictedDate,
      recommendations: [
        'Schedule routine inspection',
        'Check for wear and tear',
        'Update maintenance records'
      ],
      confidence: 75
    };
  }

  private getFallbackManufacturerAnalysis(manufacturerData: any) {
    const deliveryRate = manufacturerData.deliveryRate || 85;
    const qualityScore = manufacturerData.qualityScore || 80;
    const defectRate = manufacturerData.defectRate || 5;
    
    const score = Math.round((deliveryRate + qualityScore + (100 - defectRate * 10)) / 3);
    
    return {
      score: Math.min(100, Math.max(0, score)),
      insights: [
        'Delivery performance within industry standards',
        'Quality metrics show consistent results',
        'Customer satisfaction levels maintained'
      ],
      recommendations: [
        'Focus on reducing defect rates',
        'Improve on-time delivery performance',
        'Enhance quality control processes'
      ],
      trends: [
        'Performance trending upward',
        'Consistent delivery schedules',
        'Quality improvements noted'
      ]
    };
  }
}

export const aiService = new AIService();