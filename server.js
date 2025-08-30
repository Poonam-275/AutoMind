const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database simulation (replace with MongoDB in production)
let userData = {
    trips: [],
    carbonFootprint: 0,
    ecoScore: 850,
    badges: ['Eco Champion', 'Green Driver'],
    preferences: {}
};

let carData = {
    comparisons: [],
    favorites: [],
    recommendations: []
};

// Routes

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Google Maps API integration
app.post('/api/routes', async (req, res) => {
    try {
        const { origin, destination, routeType } = req.body;
        
        // In production, integrate with Google Maps API
        // const mapsResponse = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
        //     params: {
        //         origin: origin,
        //         destination: destination,
        //         mode: 'driving',
        //         optimize: routeType === 'eco' ? 'true' : 'false',
        //         key: process.env.GOOGLE_MAPS_API_KEY
        //     }
        // });

        // Simulated response for demo
        const simulatedRoute = {
            routes: [{
                legs: [{
                    distance: { value: Math.floor(Math.random() * 50000 + 10000) },
                    duration: { value: Math.floor(Math.random() * 3600 + 1200) }
                }],
                overview_polyline: { points: "sample_polyline_data" }
            }],
            fuelCost: Math.floor(Math.random() * 200 + 50),
            co2Emissions: Math.floor(Math.random() * 15 + 5),
            trafficStatus: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)]
        };

        res.json({
            success: true,
            data: simulatedRoute
        });
    } catch (error) {
        console.error('Route calculation error:', error);
        res.status(500).json({ success: false, error: 'Failed to calculate route' });
    }
});

// HERE API integration for alternative routing
app.post('/api/here-routes', async (req, res) => {
    try {
        const { origin, destination } = req.body;
        
        // In production, integrate with HERE API
        // const hereResponse = await axios.get('https://router.hereapi.com/v8/routes', {
        //     params: {
        //         transportMode: 'car',
        //         origin: origin,
        //         destination: destination,
        //         return: 'summary,polyline',
        //         apikey: process.env.HERE_API_KEY
        //     }
        // });

        // Simulated HERE API response
        const simulatedHereRoute = {
            routes: [{
                sections: [{
                    summary: {
                        length: Math.floor(Math.random() * 45000 + 8000),
                        duration: Math.floor(Math.random() * 3200 + 1000)
                    }
                }]
            }],
            ecoScore: Math.floor(Math.random() * 30 + 70),
            alternativeRoutes: 2
        };

        res.json({
            success: true,
            data: simulatedHereRoute
        });
    } catch (error) {
        console.error('HERE API error:', error);
        res.status(500).json({ success: false, error: 'Failed to get alternative routes' });
    }
});

// Car comparison API
app.post('/api/compare-cars', (req, res) => {
    try {
        const { cars } = req.body;
        
        // Process car comparison data
        const comparisonResults = cars.map(car => {
            const totalScore = calculateCarScore(car);
            return {
                ...car,
                totalScore: totalScore,
                recommendation: getRecommendationLevel(totalScore)
            };
        });

        // Sort by total score
        comparisonResults.sort((a, b) => b.totalScore - a.totalScore);

        res.json({
            success: true,
            data: {
                comparison: comparisonResults,
                bestMatch: comparisonResults[0],
                insights: generateComparisonInsights(comparisonResults)
            }
        });
    } catch (error) {
        console.error('Car comparison error:', error);
        res.status(500).json({ success: false, error: 'Failed to compare cars' });
    }
});

// AI-driven car recommendations
app.post('/api/ai-recommendations', (req, res) => {
    try {
        const { budget, usage, priority, family_size } = req.body;
        
        // AI algorithm for car recommendations
        const recommendations = generateAIRecommendations(budget, usage, priority, family_size);
        
        res.json({
            success: true,
            data: {
                recommendations: recommendations,
                confidence: calculateConfidenceScore(budget, usage, priority),
                alternatives: getAlternativeOptions(budget, usage)
            }
        });
    } catch (error) {
        console.error('AI recommendation error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
    }
});

// Carbon footprint tracking
app.post('/api/track-carbon', (req, res) => {
    try {
        const { distance, vehicleType, route } = req.body;
        
        const carbonData = calculateCarbonFootprint(distance, vehicleType);
        
        // Update user data
        userData.trips.push({
            date: new Date(),
            distance: distance,
            vehicleType: vehicleType,
            carbonEmitted: carbonData.emissions,
            route: route
        });
        
        userData.carbonFootprint += carbonData.emissions;
        
        // Calculate badges and achievements
        const badges = checkForNewBadges(userData);
        
        res.json({
            success: true,
            data: {
                ...carbonData,
                newBadges: badges,
                totalFootprint: userData.carbonFootprint,
                ecoScore: userData.ecoScore
            }
        });
    } catch (error) {
        console.error('Carbon tracking error:', error);
        res.status(500).json({ success: false, error: 'Failed to track carbon footprint' });
    }
});

// EV recommendations with subsidy information
app.post('/api/ev-recommendations', (req, res) => {
    try {
        const { state, budget, usage } = req.body;
        
        const evOptions = getEVRecommendations(state, budget, usage);
        
        res.json({
            success: true,
            data: {
                recommendations: evOptions,
                subsidies: getSubsidyInfo(state),
                chargingStations: getNearbyChargingStations(state),
                savingsCalculation: calculateEVSavings(budget, usage)
            }
        });
    } catch (error) {
        console.error('EV recommendation error:', error);
        res.status(500).json({ success: false, error: 'Failed to get EV recommendations' });
    }
});

// Get user dashboard data
app.get('/api/dashboard', (req, res) => {
    try {
        const dashboardData = {
            stats: {
                totalTrips: userData.trips.length,
                carbonSaved: Math.max(0, 2000 - userData.carbonFootprint),
                fuelSaved: calculateFuelSavings(userData.trips),
                ecoScore: userData.ecoScore
            },
            recentTrips: userData.trips.slice(-10),
            badges: userData.badges,
            monthlyTrends: generateMonthlyTrends(),
            recommendations: getPersonalizedTips(userData)
        };
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to load dashboard' });
    }
});

// Live traffic updates
app.get('/api/traffic-updates', (req, res) => {
    try {
        const trafficData = {
            currentStatus: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)],
            incidents: generateTrafficIncidents(),
            alternativeRoutes: getAlternativeRoutes(),
            lastUpdated: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: trafficData
        });
    } catch (error) {
        console.error('Traffic update error:', error);
        res.status(500).json({ success: false, error: 'Failed to get traffic updates' });
    }
});

// Utility functions

function calculateCarScore(car) {
    // Weighted scoring algorithm
    const weights = {
        price: 0.25,
        mileage: 0.3,
        safety: 0.25,
        emissions: 0.15,
        maintenance: 0.05
    };
    
    // Normalize values to 0-100 scale
    const normalizedPrice = Math.max(0, 100 - (car.price / 50) * 100);
    const normalizedMileage = (car.mileage / 30) * 100;
    const normalizedSafety = (car.safety / 5) * 100;
    const normalizedEmissions = Math.max(0, 100 - (car.emissions / 200) * 100);
    const normalizedMaintenance = Math.max(0, 100 - (car.maintenance / 60000) * 100);
    
    return (
        normalizedPrice * weights.price +
        normalizedMileage * weights.mileage +
        normalizedSafety * weights.safety +
        normalizedEmissions * weights.emissions +
        normalizedMaintenance * weights.maintenance
    );
}

function getRecommendationLevel(score) {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 65) return 'Recommended';
    if (score >= 50) return 'Consider';
    return 'Not Recommended';
}

function generateComparisonInsights(cars) {
    const insights = [];
    
    if (cars.length > 1) {
        const bestMileage = cars.reduce((prev, curr) => prev.mileage > curr.mileage ? prev : curr);
        const mostAffordable = cars.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
        const safest = cars.reduce((prev, curr) => prev.safety > curr.safety ? prev : curr);
        
        insights.push(`${bestMileage.name} offers the best fuel efficiency at ${bestMileage.mileage} km/l`);
        insights.push(`${mostAffordable.name} is the most budget-friendly option at ₹${mostAffordable.price} lakhs`);
        insights.push(`${safest.name} provides the highest safety rating of ${safest.safety}/5`);
    }
    
    return insights;
}

function generateAIRecommendations(budget, usage, priority, familySize = 4) {
    // Simulated AI recommendation logic
    const recommendations = [];
    
    // Load car database and apply filters
    const availableCars = Object.keys(carDatabase).flatMap(make => 
        Object.keys(carDatabase[make]).map(model => ({
            name: `${make.charAt(0).toUpperCase() + make.slice(1)} ${model}`,
            make: make,
            model: model,
            ...carDatabase[make][model]
        }))
    ).filter(car => car.price <= budget);
    
    // AI scoring based on user preferences
    availableCars.forEach(car => {
        let aiScore = 0;
        
        // Priority-based scoring
        switch (priority) {
            case 'fuel':
                aiScore += car.mileage * 4;
                break;
            case 'performance':
                aiScore += (car.price / budget) * 50;
                break;
            case 'safety':
                aiScore += car.safety * 18;
                break;
            case 'features':
                aiScore += car.safety * 10 + (car.price / budget) * 30;
                break;
        }
        
        // Usage-based adjustments
        if (usage === 'city' && car.mileage > 20) aiScore += 15;
        if (usage === 'highway' && car.mileage > 15) aiScore += 10;
        if (usage === 'family' && car.safety >= 4) aiScore += 20;
        if (usage === 'mixed') aiScore += car.mileage * 2;
        
        // Family size considerations
        if (familySize > 4 && car.price > 10) aiScore += 10;
        if (familySize <= 2 && car.price < 10) aiScore += 5;
        
        car.aiScore = aiScore;
    });
    
    // Sort and return top 5 recommendations
    return availableCars
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 5)
        .map(car => ({
            ...car,
            confidence: Math.min(95, car.aiScore + Math.floor(Math.random() * 20)),
            reason: generateRecommendationReason(car, priority, usage)
        }));
}

function calculateConfidenceScore(budget, usage, priority) {
    // AI confidence calculation
    let confidence = 75;
    
    if (budget > 5) confidence += 10;
    if (usage && priority) confidence += 15;
    
    return Math.min(95, confidence + Math.floor(Math.random() * 10));
}

function getAlternativeOptions(budget, usage) {
    return [
        { type: 'Used Cars', description: 'Consider certified pre-owned vehicles for better value' },
        { type: 'Leasing', description: 'Monthly leasing options available starting ₹15,000/month' },
        { type: 'EV Options', description: 'Electric vehicles with government subsidies' }
    ];
}

function calculateCarbonFootprint(distance, vehicleType) {
    const emissionFactors = {
        petrol: { factor: 2.31, efficiency: 15 },
        diesel: { factor: 2.68, efficiency: 18 },
        cng: { factor: 1.85, efficiency: 20 },
        electric: { factor: 0.5, efficiency: 4 }, // kWh per km
        hybrid: { factor: 1.5, efficiency: 25 }
    };
    
    const vehicle = emissionFactors[vehicleType];
    const fuelConsumed = distance / vehicle.efficiency;
    const emissions = fuelConsumed * vehicle.factor;
    
    return {
        emissions: emissions,
        fuelConsumed: fuelConsumed,
        cost: vehicleType === 'electric' ? fuelConsumed * 8 : fuelConsumed * 105,
        ecoScore: Math.max(0, 100 - (emissions / distance * 100))
    };
}

function checkForNewBadges(userData) {
    const newBadges = [];
    
    // Badge criteria
    if (userData.carbonFootprint < 500 && !userData.badges.includes('Carbon Warrior')) {
        newBadges.push('Carbon Warrior');
        userData.badges.push('Carbon Warrior');
    }
    
    if (userData.trips.length >= 50 && !userData.badges.includes('Road Master')) {
        newBadges.push('Road Master');
        userData.badges.push('Road Master');
    }
    
    if (userData.ecoScore > 1000 && !userData.badges.includes('Eco Legend')) {
        newBadges.push('Eco Legend');
        userData.badges.push('Eco Legend');
    }
    
    return newBadges;
}

function getEVRecommendations(state, budget, usage) {
    const evDatabase = {
        'Tata Nexon EV': { price: 16.5, range: 312, charging: 8.5, efficiency: 4.0 },
        'MG ZS EV': { price: 22.5, range: 419, charging: 7.0, efficiency: 3.8 },
        'Hyundai Kona Electric': { price: 24.0, range: 452, charging: 9.0, efficiency: 3.5 },
        'Mahindra eXUV300': { price: 18.0, range: 375, charging: 8.0, efficiency: 4.2 },
        'BYD Atto 3': { price: 35.0, range: 521, charging: 7.5, efficiency: 3.2 },
        'Tata Tigor EV': { price: 13.5, range: 306, charging: 8.0, efficiency: 4.5 }
    };
    
    const stateSubsidy = getStateSubsidy(state);
    
    return Object.keys(evDatabase)
        .map(model => ({
            name: model,
            ...evDatabase[model],
            finalPrice: evDatabase[model].price - 1.5 - stateSubsidy, // Central + State subsidy
            totalSubsidy: 1.5 + stateSubsidy,
            suitabilityScore: calculateEVSuitability(evDatabase[model], usage)
        }))
        .filter(ev => ev.finalPrice <= budget)
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

function getStateSubsidy(state) {
    const subsidies = {
        maharashtra: 2.5,
        delhi: 1.5,
        karnataka: 2.0,
        gujarat: 1.5,
        rajasthan: 1.0,
        telangana: 1.2,
        kerala: 1.0
    };
    
    return subsidies[state.toLowerCase()] || 0.5;
}

function getSubsidyInfo(state) {
    return {
        central: 1.5,
        state: getStateSubsidy(state),
        additional: ['FAME II benefits', 'Registration fee waiver', 'Road tax exemption'],
        validity: '2025-2027'
    };
}

function calculateEVSuitability(ev, usage) {
    let score = 50;
    
    if (usage === 'city' && ev.range > 300) score += 30;
    if (usage === 'highway' && ev.range > 400) score += 35;
    if (usage === 'mixed' && ev.range > 350) score += 25;
    if (ev.charging < 8) score += 15;
    if (ev.efficiency > 4) score += 10;
    
    return Math.min(100, score);
}

function getNearbyChargingStations(state) {
    // Simulated charging station data
    const stations = {
        maharashtra: [
            { name: 'Tata Power Station - Bandra', type: 'Fast Charging', distance: 2.5 },
            { name: 'Fortum Station - Andheri', type: 'Standard', distance: 4.2 },
            { name: 'Ather Grid - Powai', type: 'Fast Charging', distance: 6.1 }
        ],
        delhi: [
            { name: 'Delhi Metro Station - CP', type: 'Fast Charging', distance: 1.8 },
            { name: 'NDMC Station - Khan Market', type: 'Standard', distance: 3.5 },
            { name: 'Tata Power - Gurgaon', type: 'Fast Charging', distance: 15.2 }
        ]
    };
    
    return stations[state] || [
        { name: 'Public Charging Hub', type: 'Standard', distance: 5.0 },
        { name: 'Fast Charge Station', type: 'Fast Charging', distance: 8.5 }
    ];
}

function calculateEVSavings(budget, usage) {
    const annualKm = usage === 'city' ? 12000 : usage === 'highway' ? 18000 : 15000;
    
    // Petrol car costs
    const petrolEfficiency = 15; // km/l
    const petrolPrice = 105; // ₹ per liter
    const petrolAnnualCost = (annualKm / petrolEfficiency) * petrolPrice;
    
    // EV costs
    const evEfficiency = 4; // km per kWh
    const electricityPrice = 8; // ₹ per kWh
    const evAnnualCost = (annualKm / evEfficiency) * electricityPrice;
    
    return {
        annualSavings: petrolAnnualCost - evAnnualCost,
        fiveYearSavings: (petrolAnnualCost - evAnnualCost) * 5,
        co2Savings: (annualKm / petrolEfficiency) * 2.31, // kg CO2 saved per year
        paybackPeriod: Math.ceil((budget * 100000) / (petrolAnnualCost - evAnnualCost)) // years
    };
}

function calculateFuelSavings(trips) {
    // Calculate how much user saved by eco-driving
    let totalSaved = 0;
    trips.forEach(trip => {
        if (trip.vehicleType === 'electric') totalSaved += trip.distance * 3;
        if (trip.vehicleType === 'cng') totalSaved += trip.distance * 1.5;
    });
    return totalSaved;
}

function generateMonthlyTrends() {
    // Generate sample monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const fuelCosts = [3200, 2950, 3100, 2800, 2650, 2400];
    const emissions = [145, 135, 140, 128, 120, 115];
    
    return {
        months: months,
        fuelCosts: fuelCosts,
        emissions: emissions,
        trend: 'improving'
    };
}

function getPersonalizedTips(userData) {
    const tips = [
        "Plan your routes during off-peak hours to save 20% on fuel",
        "Regular maintenance can improve efficiency by 10%",
        "Consider carpooling for trips over 20km",
        "Check tire pressure monthly for optimal fuel economy"
    ];
    
    // Personalize based on user data
    if (userData.ecoScore > 800) {
        tips.push("You're an eco-champion! Share your tips with the community");
    }
    
    if (userData.trips.length > 30) {
        tips.push("Frequent traveler detected - consider hybrid or EV options");
    }
    
    return tips.slice(0, 3);
}

function generateTrafficIncidents() {
    return [
        { location: 'Western Express Highway', type: 'Heavy Traffic', severity: 'moderate' },
        { location: 'Mumbai-Pune Expressway', type: 'Construction Work', severity: 'low' },
        { location: 'Bandra-Worli Sea Link', type: 'Accident Cleared', severity: 'low' }
    ];
}

function getAlternativeRoutes() {
    return [
        { name: 'Scenic Route', addedTime: 15, fuelSaving: 12, co2Reduction: 8 },
        { name: 'Highway Route', addedTime: -5, fuelSaving: -5, co2Reduction: -2 },
        { name: 'Local Roads', addedTime: 20, fuelSaving: 18, co2Reduction: 15 }
    ];
}

function generateRecommendationReason(car, priority, usage) {
    const reasons = [];
    
    if (car.mileage > 20) reasons.push('excellent fuel efficiency');
    if (car.safety >= 5) reasons.push('top safety rating');
    if (car.emissions < 130) reasons.push('low emissions');
    if (priority === 'fuel' && car.mileage > 22) reasons.push('matches fuel priority');
    if (usage === 'family' && car.safety >= 4) reasons.push('family-safe');
    
    return reasons.slice(0, 2).join(' and ') || 'good overall value';
}

// Car database (same as frontend)
const carDatabase = {
    maruti: {
        'Swift': { price: 6.5, mileage: 23.2, safety: 4, emissions: 120, maintenance: 35000 },
        'Baleno': { price: 7.5, mileage: 22.8, safety: 4, emissions: 115, maintenance: 38000 },
        'Dzire': { price: 7.0, mileage: 24.1, safety: 4, emissions: 118, maintenance: 36000 },
        'Vitara Brezza': { price: 9.5, mileage: 17.2, safety: 4, emissions: 145, maintenance: 42000 }
    },
    hyundai: {
        'i20': { price: 8.5, mileage: 20.5, safety: 5, emissions: 125, maintenance: 40000 },
        'Creta': { price: 12.5, mileage: 16.8, safety: 5, emissions: 155, maintenance: 45000 },
        'Venue': { price: 9.0, mileage: 18.2, safety: 4, emissions: 140, maintenance: 41000 },
        'Verna': { price: 11.5, mileage: 19.1, safety: 5, emissions: 135, maintenance: 43000 }
    },
    tata: {
        'Nexon': { price: 8.5, mileage: 17.5, safety: 5, emissions: 142, maintenance: 39000 },
        'Harrier': { price: 16.0, mileage: 14.2, safety: 5, emissions: 170, maintenance: 48000 },
        'Altroz': { price: 7.5, mileage: 22.1, safety: 5, emissions: 115, maintenance: 37000 },
        'Safari': { price: 18.0, mileage: 13.8, safety: 5, emissions: 180, maintenance: 52000 }
    }
};

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚗 AutoMind server running on port ${PORT}`);
    console.log(`📱 Access the app at: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;