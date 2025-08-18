import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface ManualParameter {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  category: string;
}

interface ParameterScores {
  [key: string]: {
    score: number;
    reasoning: string;
    weightedScore: number;
    dataBaseline: number;
    confidence: 'high' | 'medium' | 'low';
  };
}

@Injectable()
export class DataMapperService {
  private evaluationConfig: any;
  private readonly MANUAL_PARAMETERS: ManualParameter[] = [
    { id: "food_brand_presence", weight: 4, maxScore: 20, name: "Food Brand Presence", category: "high_priority" },
    { id: "clothing_brand_presence", weight: 2, maxScore: 10, name: "Clothing Brand Presence", category: "medium_priority" },
    { id: "footwear_brand_presence", weight: 2, maxScore: 10, name: "Footwear Brand Presence", category: "medium_priority" },
    { id: "nearby_schools_colleges", weight: 3, maxScore: 15, name: "Nearby Schools/Colleges", category: "medium_priority" },
    { id: "petrol_pump_nearby", weight: 2, maxScore: 10, name: "Petrol Pump Nearby", category: "lower_priority" },
    { id: "footfall", weight: 5, maxScore: 25, name: "Footfall", category: "high_priority" },
    { id: "target_audience_fit", weight: 5, maxScore: 25, name: "Target Audience Fit", category: "high_priority" },
    { id: "competition_pricing_momo", weight: 3, maxScore: 15, name: "Competition Pricing (Momo)", category: "medium_priority" },
    { id: "spending_capacity", weight: 4, maxScore: 20, name: "Spending Capacity", category: "high_priority" },
    { id: "nearby_businesses_offices", weight: 4, maxScore: 20, name: "Nearby Businesses/Offices", category: "high_priority" },
    { id: "vehicle_mix_mobility", weight: 2, maxScore: 10, name: "Vehicle Mix & Mobility", category: "lower_priority" },
    { id: "residential_society_presence", weight: 4, maxScore: 20, name: "Residential/Society Presence", category: "high_priority" },
    { id: "shopping_preferences_nearby", weight: 3, maxScore: 15, name: "Shopping Preferences Nearby", category: "medium_priority" },
    { id: "fitness_gym_walking_culture", weight: 3, maxScore: 15, name: "Fitness/Gym Culture", category: "medium_priority" },
    { id: "zomato_swiggy_delivery_density", weight: 4, maxScore: 20, name: "Zomato/Swiggy Delivery Density", category: "high_priority" },
    { id: "student_vs_office_crowd_mix", weight: 3, maxScore: 15, name: "Student vs Office Crowd Mix", category: "medium_priority" },
    { id: "nightlife_cafe_presence", weight: 3, maxScore: 15, name: "Nightlife/Cafe Presence", category: "medium_priority" },
    { id: "local_events_weekly_bazaars", weight: 2, maxScore: 10, name: "Local Events/Weekly Bazaars", category: "lower_priority" },
    { id: "hospitals_clinics_nearby", weight: 2, maxScore: 10, name: "Hospitals/Clinics Nearby", category: "lower_priority" },
    { id: "police_security_presence", weight: 2, maxScore: 10, name: "Police/Security Presence", category: "lower_priority" },
    { id: "outdoor_branding_scope", weight: 5, maxScore: 25, name: "Outdoor Branding Scope", category: "high_priority" },
    { id: "footpath_road_width", weight: 3, maxScore: 15, name: "Footpath/Road Width", category: "medium_priority" }
  ];

  constructor() {
    this.loadEvaluationConfig();
  }

  private loadEvaluationConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/evaluation.config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      this.evaluationConfig = JSON.parse(configData);
    } catch (error) {
      console.error('❌ Failed to load evaluation configuration:', error);
      this.evaluationConfig = { evaluationParameters: [] };
    }
  }

  /**
   * 🎯 CRITICAL: Map footfall based on business density (most critical parameter)
   * Uses proven thresholds from manual evaluation to ensure varied scores
   */
  calculateFootfallScore(totalBusinesses: number, radius: number): number {
    console.log(`📊 Calculating footfall score: ${totalBusinesses} businesses within ${radius}m`);
    
    // Density-based scoring with proven thresholds
    const density = totalBusinesses / (radius / 1000); // businesses per km
    
    if (totalBusinesses >= 100 || density >= 80) {
      console.log(`🔥 Exceptional footfall: ${totalBusinesses} businesses (${density.toFixed(1)}/km) = Score 5`);
      return 5; // Exceptional density
    }
    if (totalBusinesses >= 60 || density >= 50) {
      console.log(`⭐ High footfall: ${totalBusinesses} businesses (${density.toFixed(1)}/km) = Score 4`);
      return 4; // High density
    }
    if (totalBusinesses >= 30 || density >= 25) {
      console.log(`👍 Moderate footfall: ${totalBusinesses} businesses (${density.toFixed(1)}/km) = Score 3`);
      return 3; // Moderate density
    }
    if (totalBusinesses >= 15 || density >= 12) {
      console.log(`📉 Low footfall: ${totalBusinesses} businesses (${density.toFixed(1)}/km) = Score 2`);
      return 2; // Low density
    }
    
    console.log(`❌ Very low footfall: ${totalBusinesses} businesses (${density.toFixed(1)}/km) = Score 1`);
    return 1; // Very low density
  }

  /**
   * 🎯 CRITICAL: Map food brand presence (high priority parameter)
   * Uses exact brand detection to ensure accurate scoring
   */
  calculateFoodBrandScore(brands: any): number {
    const premiumBrands = ['McDonald\'s', 'KFC', 'Domino\'s', 'Pizza Hut', 'Starbucks', 'Costa Coffee'];
    const midTierBrands = ['Cafe Coffee Day', 'Subway', 'Burger King', 'Haldiram\'s', 'Bikanervala'];
    const localBrands = ['Wow! Momo', 'Faasos', 'Box8', 'Behrouz Biryani'];

    let premiumCount = 0;
    let midTierCount = 0;
    let localCount = 0;
    const foundBrands = [];

    Object.entries(brands).forEach(([brandName, brandData]: [string, any]) => {
      const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
      if (places.length > 0) {
        foundBrands.push(brandName);
        if (premiumBrands.includes(brandName)) premiumCount++;
        else if (midTierBrands.includes(brandName)) midTierCount++;
        else if (localBrands.includes(brandName)) localCount++;
      }
    });

    console.log(`🍔 Food brands found: Premium=${premiumCount}, MidTier=${midTierCount}, Local=${localCount}`);
    console.log(`📝 Brands detected: ${foundBrands.join(', ')}`);

    // Scoring based on brand mix quality
    if (premiumCount >= 4) {
      console.log(`🔥 Exceptional brand presence: ${premiumCount} premium brands = Score 5`);
      return 5; // "Haldiram's, McD, CCD, KFC"
    }
    if (premiumCount >= 2 || (premiumCount >= 1 && midTierCount >= 2)) {
      console.log(`⭐ Good brand presence: Premium=${premiumCount}, MidTier=${midTierCount} = Score 4`);
      return 4; // "Mix of local + Domino's"
    }
    if (premiumCount >= 1 || midTierCount >= 2 || localCount >= 3) {
      console.log(`👍 Moderate brand presence: Premium=${premiumCount}, MidTier=${midTierCount}, Local=${localCount} = Score 3`);
      return 3; // "Small brands"
    }
    if (midTierCount >= 1 || localCount >= 1) {
      console.log(`📉 Limited brand presence: MidTier=${midTierCount}, Local=${localCount} = Score 2`);
      return 2; // "Local vendors only"
    }

    console.log(`❌ No brand presence detected = Score 1`);
    return 1; // "No brands"
  }

  /**
   * 🎯 CRITICAL: Map target audience fit (critical parameter)
   * Based on demographic indicators from business types
   */
  calculateTargetAudienceScore(businesses: any): number {
    const universities = (businesses.universities?.length || 0);
    const hospitals = (businesses.hospitals?.length || 0);
    const schools = (businesses.schools?.length || 0);
    const malls = (businesses.shopping_malls?.length || 0);
    const offices = (businesses.banks?.length || 0) + (businesses.atms?.length || 0); // Proxy for office areas
    
    console.log(`👥 Demographics: Universities=${universities}, Schools=${schools}, Hospitals=${hospitals}, Malls=${malls}, Offices=${offices}`);

    // Score based on combination of indicators
    if (universities >= 2 && offices >= 10 && malls >= 1) {
      console.log(`🔥 Perfect audience fit: Multiple universities + offices + malls = Score 5`);
      return 5; // "Urban youth, couples, families"
    }
    if (universities >= 1 && (offices >= 5 || malls >= 1)) {
      console.log(`⭐ Excellent audience fit: University + commercial activity = Score 4`);
      return 4; // "Students + Office Crowd"
    }
    if (universities >= 1 || schools >= 2 || (offices >= 3 && hospitals >= 1)) {
      console.log(`👍 Good audience fit: Educational or mixed commercial = Score 3`);
      return 3; // "Mixed lower-mid income"
    }
    if (schools >= 1 || offices >= 2 || hospitals >= 1) {
      console.log(`📉 Fair audience fit: Some institutional presence = Score 2`);
      return 2; // "Budget family crowd"
    }

    console.log(`❌ Poor audience fit: Limited institutional presence = Score 1`);
    return 1; // "Labour-dominated"
  }

  /**
   * 🎯 Calculate spending capacity based on premium brand presence and ratings
   */
  calculateSpendingCapacityScore(brands: any, businesses: any): number {
    const premiumBrandCount = this.countPremiumBrands(brands);
    const avgRating = this.calculateAverageBusinessRating(businesses);
    const highRatedCount = this.countHighRatedBusinesses(businesses);
    
    console.log(`💰 Spending indicators: Premium brands=${premiumBrandCount}, Avg rating=${avgRating.toFixed(1)}, High rated=${highRatedCount}`);

    if (premiumBrandCount >= 5 && avgRating >= 4.2) {
      console.log(`🔥 Very high spending capacity = Score 5`);
      return 5;
    }
    if (premiumBrandCount >= 3 && avgRating >= 3.8) {
      console.log(`⭐ High spending capacity = Score 4`);
      return 4;
    }
    if (premiumBrandCount >= 1 && avgRating >= 3.5) {
      console.log(`👍 Medium spending capacity = Score 3`);
      return 3;
    }
    if (avgRating >= 3.0 || premiumBrandCount >= 1) {
      console.log(`📉 Low spending capacity = Score 2`);
      return 2;
    }

    console.log(`❌ Very low spending capacity = Score 1`);
    return 1;
  }

  /**
   * 🎯 Calculate competition score with balanced approach
   */
  calculateCompetitionScore(competitors: any[], radius: number): number {
    const directCompetitors = competitors.filter(c => 
      this.isDirectMomoCompetitor(c.name || '')
    );
    const totalFoodPlaces = competitors.length;
    const density = totalFoodPlaces / (radius / 1000);
    
    console.log(`🥊 Competition: Direct=${directCompetitors.length}, Total food=${totalFoodPlaces}, Density=${density.toFixed(1)}/km`);

    // Balanced competition scoring (moderate competition is good)
    if (density >= 8 && density <= 15 && directCompetitors.length <= 3) {
      console.log(`🔥 Optimal competition level = Score 5`);
      return 5; // Optimal - proven market with room
    }
    if (density >= 5 && density < 8) {
      console.log(`⭐ Good competition level = Score 4`);
      return 4; // Good - emerging market
    }
    if (density >= 15 && density < 25) {
      console.log(`👍 Moderate competition level = Score 3`);
      return 3; // Moderate - saturated but viable
    }
    if (density < 5) {
      console.log(`📉 Low competition (unproven market) = Score 2`);
      return 2; // Low - unproven market demand
    }

    console.log(`❌ Oversaturated market = Score 1`);
    return 1; // Oversaturated
  }

  /**
   * 🎯 Map all 22 parameters to scores using data-driven thresholds
   */
  mapAllParametersToScores(googleAPIData: any): ParameterScores {
    const { businesses, brands, summary } = googleAPIData;
    const totalBusinesses = summary.overall?.totalBusinesses || 0;
    const radius = googleAPIData.coordinates?.radius || 1000;

    console.log(`🎯 DATA MAPPER: Processing ${totalBusinesses} businesses within ${radius}m radius`);

    const scores: ParameterScores = {};

    // Map each parameter using proven thresholds
    scores.food_brand_presence = {
      score: this.calculateFoodBrandScore(brands),
      reasoning: this.getFoodBrandReasoning(brands),
      weightedScore: this.calculateFoodBrandScore(brands) * 4,
      dataBaseline: this.calculateFoodBrandScore(brands),
      confidence: 'high'
    };

    scores.footfall = {
      score: this.calculateFootfallScore(totalBusinesses, radius),
      reasoning: this.getFootfallReasoning(totalBusinesses, radius),
      weightedScore: this.calculateFootfallScore(totalBusinesses, radius) * 5,
      dataBaseline: this.calculateFootfallScore(totalBusinesses, radius),
      confidence: 'high'
    };

    scores.target_audience_fit = {
      score: this.calculateTargetAudienceScore(businesses),
      reasoning: this.getTargetAudienceReasoning(businesses),
      weightedScore: this.calculateTargetAudienceScore(businesses) * 5,
      dataBaseline: this.calculateTargetAudienceScore(businesses),
      confidence: 'high'
    };

    scores.spending_capacity = {
      score: this.calculateSpendingCapacityScore(brands, businesses),
      reasoning: this.getSpendingCapacityReasoning(brands, businesses),
      weightedScore: this.calculateSpendingCapacityScore(brands, businesses) * 4,
      dataBaseline: this.calculateSpendingCapacityScore(brands, businesses),
      confidence: 'high'
    };

    // Map remaining parameters with simpler logic
    scores.clothing_brand_presence = this.mapClothingBrands(brands);
    scores.footwear_brand_presence = this.mapFootwearBrands(brands);
    scores.nearby_schools_colleges = this.mapEducationalInstitutions(businesses);
    scores.petrol_pump_nearby = this.mapPetrolPumps(businesses);
    scores.competition_pricing_momo = this.mapCompetition(businesses);
    scores.nearby_businesses_offices = this.mapOffices(businesses);
    scores.vehicle_mix_mobility = this.mapTransportation(businesses);
    scores.residential_society_presence = this.mapResidential(businesses);
    scores.shopping_preferences_nearby = this.mapShopping(businesses);
    scores.fitness_gym_walking_culture = this.mapFitness(businesses);
    scores.zomato_swiggy_delivery_density = this.mapDeliveryDensity(businesses);
    scores.student_vs_office_crowd_mix = this.mapCrowdMix(businesses);
    scores.nightlife_cafe_presence = this.mapNightlife(businesses);
    scores.local_events_weekly_bazaars = this.mapEvents(businesses);
    scores.hospitals_clinics_nearby = this.mapHealthcare(businesses);
    scores.police_security_presence = this.mapSecurity(businesses);
    scores.outdoor_branding_scope = this.mapBrandingScope(totalBusinesses, radius);
    scores.footpath_road_width = this.mapInfrastructure(businesses);

    console.log(`✅ DATA MAPPER: Mapped all 22 parameters with data-driven scores`);
    return scores;
  }

  /**
   * Helper methods for reasoning generation
   */
  private getFoodBrandReasoning(brands: any): string {
    const foundBrands = Object.entries(brands)
      .filter(([_, brandData]: [string, any]) => {
        const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
        return places.length > 0;
      })
      .map(([brandName]) => brandName);

    return `Found ${foundBrands.length} food brands: ${foundBrands.slice(0, 5).join(', ')}${foundBrands.length > 5 ? ` and ${foundBrands.length - 5} more` : ''}`;
  }

  private getFootfallReasoning(totalBusinesses: number, radius: number): string {
    const density = totalBusinesses / (radius / 1000);
    return `Total ${totalBusinesses} businesses within ${radius}m (${density.toFixed(1)} businesses per km) indicates ${
      totalBusinesses >= 100 ? 'exceptional' :
      totalBusinesses >= 60 ? 'high' :
      totalBusinesses >= 30 ? 'moderate' :
      totalBusinesses >= 15 ? 'low' : 'very low'
    } footfall potential`;
  }

  private getTargetAudienceReasoning(businesses: any): string {
    const universities = businesses.universities?.length || 0;
    const schools = businesses.schools?.length || 0;
    const hospitals = businesses.hospitals?.length || 0;
    const malls = businesses.shopping_malls?.length || 0;
    
    return `Demographics: ${universities} universities, ${schools} schools, ${hospitals} hospitals, ${malls} malls indicating ${
      universities >= 2 ? 'excellent' :
      universities >= 1 ? 'good' :
      schools >= 2 ? 'moderate' : 'limited'
    } target audience alignment`;
  }

  private getSpendingCapacityReasoning(brands: any, businesses: any): string {
    const premiumCount = this.countPremiumBrands(brands);
    const avgRating = this.calculateAverageBusinessRating(businesses);
    return `${premiumCount} premium brands detected with average business rating of ${avgRating.toFixed(1)} indicating ${
      premiumCount >= 5 ? 'very high' :
      premiumCount >= 3 ? 'high' :
      premiumCount >= 1 ? 'medium' : 'low'
    } spending capacity`;
  }

  // Helper utility methods
  private isDirectMomoCompetitor(name: string): boolean {
    const momoKeywords = ['momo', 'dumpling', 'tibetan', 'wow', 'steam'];
    return momoKeywords.some(keyword => name.toLowerCase().includes(keyword));
  }

  private countPremiumBrands(brands: any): number {
    const premiumBrands = ['McDonald\'s', 'KFC', 'Domino\'s', 'Pizza Hut', 'Starbucks', 'Costa Coffee', 'H&M', 'Zara', 'Nike', 'Adidas'];
    return Object.entries(brands).filter(([brandName, brandData]: [string, any]) => {
      const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
      return places.length > 0 && premiumBrands.includes(brandName);
    }).length;
  }

  private calculateAverageBusinessRating(businesses: any): number {
    let totalRating = 0;
    let ratedCount = 0;

    Object.values(businesses).forEach((places: any[]) => {
      if (Array.isArray(places)) {
        places.forEach(place => {
          if (place.rating) {
            totalRating += place.rating;
            ratedCount++;
          }
        });
      }
    });

    return ratedCount > 0 ? totalRating / ratedCount : 0;
  }

  private countHighRatedBusinesses(businesses: any): number {
    let highRatedCount = 0;

    Object.values(businesses).forEach((places: any[]) => {
      if (Array.isArray(places)) {
        places.forEach(place => {
          if (place.rating >= 4.0) {
            highRatedCount++;
          }
        });
      }
    });

    return highRatedCount;
  }

  // Simplified mapping methods for remaining parameters
  private mapClothingBrands(brands: any): any {
    const clothingBrands = ['H&M', 'Zara', 'Uniqlo', 'Reliance Trends', 'Max Fashion'];
    const count = Object.entries(brands).filter(([brandName, brandData]: [string, any]) => {
      const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
      return places.length > 0 && clothingBrands.includes(brandName);
    }).length;

    const score = count >= 3 ? 5 : count >= 2 ? 4 : count >= 1 ? 3 : 1;
    return {
      score,
      reasoning: `Found ${count} clothing brands indicating ${score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low'} fashion market sophistication`,
      weightedScore: score * 2,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapFootwearBrands(brands: any): any {
    const footwearBrands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Bata'];
    const count = Object.entries(brands).filter(([brandName, brandData]: [string, any]) => {
      const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
      return places.length > 0 && footwearBrands.includes(brandName);
    }).length;

    const score = count >= 3 ? 5 : count >= 2 ? 4 : count >= 1 ? 3 : 1;
    return {
      score,
      reasoning: `Found ${count} footwear brands`,
      weightedScore: score * 2,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapEducationalInstitutions(businesses: any): any {
    const count = (businesses.universities?.length || 0) + (businesses.schools?.length || 0);
    const score = count >= 5 ? 5 : count >= 3 ? 4 : count >= 2 ? 3 : count >= 1 ? 2 : 1;
    return {
      score,
      reasoning: `Found ${count} educational institutions`,
      weightedScore: score * 3,
      dataBaseline: score,
      confidence: 'high' as const
    };
  }

  private mapPetrolPumps(businesses: any): any {
    const count = businesses.gas_stations?.length || 0;
    const score = count >= 3 ? 5 : count >= 2 ? 4 : count >= 1 ? 3 : 1;
    return {
      score,
      reasoning: `Found ${count} petrol pumps nearby`,
      weightedScore: score * 2,
      dataBaseline: score,
      confidence: 'high' as const
    };
  }

  private mapCompetition(businesses: any): any {
    const foodPlaces = (businesses.restaurants?.length || 0) + (businesses.meal_takeaway?.length || 0);
    const score = this.calculateCompetitionScore(businesses.restaurants || [], 1000);
    return {
      score,
      reasoning: `Found ${foodPlaces} food establishments indicating ${score >= 4 ? 'optimal' : score >= 3 ? 'moderate' : 'challenging'} competition level`,
      weightedScore: score * 3,
      dataBaseline: score,
      confidence: 'high' as const
    };
  }

  private mapOffices(businesses: any): any {
    const count = (businesses.banks?.length || 0) + (businesses.atms?.length || 0);
    const score = count >= 10 ? 5 : count >= 7 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : 1;
    return {
      score,
      reasoning: `Found ${count} business/office indicators`,
      weightedScore: score * 4,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapTransportation(businesses: any): any {
    const count = (businesses.bus_stations?.length || 0) + (businesses.metro_stations?.length || 0);
    const score = count >= 3 ? 5 : count >= 2 ? 4 : count >= 1 ? 3 : 2;
    return {
      score,
      reasoning: `Found ${count} transportation hubs`,
      weightedScore: score * 2,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapResidential(businesses: any): any {
    // Use business density as proxy for residential presence
    const totalBusinesses = Object.values(businesses).reduce((sum: number, places: any) => 
      sum + (Array.isArray(places) ? places.length : 0), 0
    ) as number;
    const score = totalBusinesses >= 50 ? 5 : totalBusinesses >= 30 ? 4 : totalBusinesses >= 15 ? 3 : totalBusinesses >= 5 ? 2 : 1;
    return {
      score,
      reasoning: `Business density of ${totalBusinesses} suggests ${score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low'} residential presence`,
      weightedScore: score * 4,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapShopping(businesses: any): any {
    const count = businesses.shopping_malls?.length || 0;
    const score = count >= 3 ? 5 : count >= 2 ? 4 : count >= 1 ? 3 : 2;
    return {
      score,
      reasoning: `Found ${count} shopping centers`,
      weightedScore: score * 3,
      dataBaseline: score,
      confidence: 'high' as const
    };
  }

  private mapFitness(businesses: any): any {
    const count = businesses.gyms?.length || 0;
    const score = count >= 3 ? 5 : count >= 2 ? 4 : count >= 1 ? 3 : 2;
    return {
      score,
      reasoning: `Found ${count} fitness facilities`,
      weightedScore: score * 3,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapDeliveryDensity(businesses: any): any {
    const restaurantCount = businesses.restaurants?.length || 0;
    const score = restaurantCount >= 20 ? 5 : restaurantCount >= 15 ? 4 : restaurantCount >= 10 ? 3 : restaurantCount >= 5 ? 2 : 1;
    return {
      score,
      reasoning: `${restaurantCount} restaurants suggest ${score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low'} delivery density`,
      weightedScore: score * 4,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapCrowdMix(businesses: any): any {
    const universities = businesses.universities?.length || 0;
    const offices = (businesses.banks?.length || 0) + (businesses.atms?.length || 0);
    const score = (universities >= 1 && offices >= 3) ? 5 : universities >= 1 ? 4 : offices >= 5 ? 3 : 2;
    return {
      score,
      reasoning: `${universities} universities and ${offices} office indicators suggest ${score >= 4 ? 'balanced' : 'limited'} crowd mix`,
      weightedScore: score * 3,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapNightlife(businesses: any): any {
    const count = (businesses.cafes?.length || 0) + (businesses.restaurants?.length || 0);
    const score = count >= 15 ? 4 : count >= 10 ? 3 : count >= 5 ? 2 : 1;
    return {
      score,
      reasoning: `${count} cafes and restaurants indicate ${score >= 3 ? 'good' : 'limited'} nightlife potential`,
      weightedScore: score * 3,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapEvents(businesses: any): any {
    const count = (businesses.places_of_worship?.length || 0) + (businesses.parks?.length || 0);
    const score = count >= 5 ? 4 : count >= 3 ? 3 : count >= 1 ? 2 : 1;
    return {
      score,
      reasoning: `${count} community venues suggest ${score >= 3 ? 'good' : 'limited'} event potential`,
      weightedScore: score * 2,
      dataBaseline: score,
      confidence: 'low' as const
    };
  }

  private mapHealthcare(businesses: any): any {
    const count = businesses.hospitals?.length || 0;
    const score = count >= 3 ? 5 : count >= 2 ? 4 : count >= 1 ? 3 : 1;
    return {
      score,
      reasoning: `Found ${count} healthcare facilities`,
      weightedScore: score * 2,
      dataBaseline: score,
      confidence: 'high' as const
    };
  }

  private mapSecurity(businesses: any): any {
    // Use business density and hospital presence as proxy for security
    const hospitals = businesses.hospitals?.length || 0;
    const score = hospitals >= 2 ? 4 : hospitals >= 1 ? 3 : 2;
    return {
      score,
      reasoning: `${hospitals} hospitals suggest ${score >= 3 ? 'good' : 'basic'} security infrastructure`,
      weightedScore: score * 2,
      dataBaseline: score,
      confidence: 'low' as const
    };
  }

  private mapBrandingScope(totalBusinesses: number, radius: number): any {
    // High business density suggests good visibility opportunities
    const density = totalBusinesses / (radius / 1000);
    const score = density >= 80 ? 5 : density >= 50 ? 4 : density >= 25 ? 3 : density >= 12 ? 2 : 1;
    return {
      score,
      reasoning: `Business density of ${density.toFixed(1)}/km suggests ${score >= 4 ? 'excellent' : score >= 3 ? 'good' : 'limited'} branding visibility`,
      weightedScore: score * 5,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }

  private mapInfrastructure(businesses: any): any {
    // Use transportation and general business presence as proxy
    const transport = (businesses.bus_stations?.length || 0) + (businesses.metro_stations?.length || 0);
    const score = transport >= 3 ? 5 : transport >= 2 ? 4 : transport >= 1 ? 3 : 2;
    return {
      score,
      reasoning: `${transport} transportation hubs suggest ${score >= 4 ? 'excellent' : score >= 3 ? 'good' : 'basic'} infrastructure`,
      weightedScore: score * 3,
      dataBaseline: score,
      confidence: 'medium' as const
    };
  }
}



