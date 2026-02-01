import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './PremiumCalculator.css';

const PremiumCalculator = ({ vehicle, onCancel, onQuoteCreated }) => {
    const [calculationData, setCalculationData] = useState({
        coverage_type: 'comprehensive',
        driver_age: 30,
        claims_history: 0,
        no_claims_years: 0,
        duration_days: 365,
        include_passenger_cover: false
    });
    
    const [premiumResult, setPremiumResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [creatingQuote, setCreatingQuote] = useState(false);
    const [errors, setErrors] = useState({});

    // Get coverage details based on type
    const getCoverageDetails = (coverageType) => {
        const coverages = {
            'third_party': {
                name: 'Third Party Only',
                description: 'Covers liability to third parties only (Legal minimum)',
                baseRate: 0.02,
                maxLiability: 600,
                coversVehicleDamage: false,
                coversTheft: false,
                coversFire: false,
                minPremium: 100
            },
            'third_party_fire_theft': {
                name: 'Third Party Fire & Theft',
                description: 'Covers third party + fire & theft of your vehicle',
                baseRate: 0.035,
                maxLiability: 600,
                coversVehicleDamage: false,
                coversTheft: true,
                coversFire: true,
                minPremium: 90
            },
            'comprehensive': {
                name: 'Comprehensive',
                description: 'Full coverage including vehicle damage, theft, fire, and third party liability',
                baseRate: 0.05,
                maxLiability: 600,
                coversVehicleDamage: true,
                coversTheft: true,
                coversFire: true,
                totalLossThreshold: 0.75,
                depreciationAnnual: 0.20,
                minPremium: 150
            }
        };
        return coverages[coverageType] || coverages.comprehensive;
    };

    // Calculate premium locally (fallback)
    const calculatePremiumLocally = () => {
        const vehicleValue = parseFloat(vehicle?.current_value) || 10000;
        const coverage = getCoverageDetails(calculationData.coverage_type);
        
        // Base premium calculation
        let basePremium = 0;
        
        if (calculationData.coverage_type === 'third_party') {
            basePremium = Math.max(100, vehicleValue * coverage.baseRate);
        } 
        else if (calculationData.coverage_type === 'third_party_fire_theft') {
            basePremium = Math.max(90, vehicleValue * coverage.baseRate);
        }
        else { // Comprehensive
            basePremium = Math.max(150, vehicleValue * coverage.baseRate);
        }
        
        // Driver age adjustments
        let ageFactor = 1.0;
        if (calculationData.driver_age < 25) ageFactor = 1.8;
        else if (calculationData.driver_age < 30) ageFactor = 1.3;
        else if (calculationData.driver_age >= 60) ageFactor = 1.2;
        
        // Claims history adjustments
        let claimsFactor = 1.0 + (calculationData.claims_history * 0.25);
        
        // No-claim discount (max 50% discount)
        let noClaimDiscountRate = Math.min(calculationData.no_claims_years * 0.05, 0.5);
        
        // Calculate adjusted premium
        let adjustedPremium = basePremium * ageFactor * claimsFactor;
        let discountAmount = adjustedPremium * noClaimDiscountRate;
        let finalPremium = adjustedPremium - discountAmount;
        
        // Add passenger cover if selected
        let passengerCoverPremium = 0;
        if (calculationData.include_passenger_cover) {
            passengerCoverPremium = finalPremium * 0.15;
            finalPremium += passengerCoverPremium;
        }
        
        // Calculate excess amount
        let excessAmount = calculationData.coverage_type === 'comprehensive' ? 
                          Math.min(vehicleValue * 0.025, 100) : 50;
        
        // Generate calculation notes
        const notes = [];
        if (calculationData.driver_age < 25) notes.push("young_driver_surcharge");
        if (calculationData.claims_history > 0) notes.push("claims_history_surcharge");
        if (calculationData.no_claims_years > 0) notes.push("no_claim_discount");
        if (calculationData.include_passenger_cover) notes.push("passenger_cover_included");
        
        return {
            base_premium: Math.round(basePremium),
            final_premium: Math.round(finalPremium),
            excess_amount: Math.round(excessAmount),
            discount_amount: Math.round(discountAmount),
            passenger_cover_premium: Math.round(passengerCoverPremium),
            coverage_details: coverage,
            breakdown: {
                age_factor: ageFactor,
                claims_factor: claimsFactor,
                no_claim_discount_rate: noClaimDiscountRate,
                notes: notes
            },
            liability_limit: coverage.maxLiability
        };
    };

    // وظيفة مساعدة للحصول على ID السيارة
    const getVehicleId = () => {
        if (!vehicle) return null;
        return vehicle.id || vehicle.pk || vehicle.vehicle_id || vehicle.vehicleId;
    };

    // Auto-calculate when vehicle is selected
    useEffect(() => {
        if (vehicle) {
            setCalculationData(prev => ({
                ...prev,
                driver_age: vehicle.driver_age || 30,
                claims_history: vehicle.claims_history || 0,
                no_claims_years: vehicle.no_claims_years || 0
            }));
            
            const vehicleId = getVehicleId();
            if (vehicleId) {
                setTimeout(() => {
                    handleCalculate();
                }, 500);
            } else {
                setErrors({ general: 'Invalid vehicle data. Missing vehicle ID.' });
            }
        }
    }, [vehicle]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setCalculationData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setCalculationData(prev => ({
                ...prev,
                [name]: name === 'driver_age' || name === 'claims_history' || 
                        name === 'no_claims_years' || name === 'duration_days'
                    ? parseInt(value) || 0
                    : value
            }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (calculationData.driver_age < 18 || calculationData.driver_age > 80) {
            newErrors.driver_age = 'Driver age must be between 18 and 80';
        }
        if (calculationData.claims_history < 0 || calculationData.claims_history > 10) {
            newErrors.claims_history = 'Claims history must be between 0 and 10';
        }
        if (calculationData.no_claims_years < 0 || calculationData.no_claims_years > 50) {
            newErrors.no_claims_years = 'No-claim years must be between 0 and 50';
        }
        if (calculationData.duration_days < 1 || calculationData.duration_days > 365) {
            newErrors.duration_days = 'Duration must be between 1 and 365 days';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCalculate = async () => {
        if (!validateForm()) {
            return;
        }
        
        const vehicleId = getVehicleId();
        if (vehicle && !vehicleId) {
            setErrors({ general: 'Cannot calculate premium. Vehicle ID is missing.' });
            return;
        }
        
        setLoading(true);
        setPremiumResult(null);
        
        try {
            let result;
            
            if (vehicle && vehicleId) {
                // Use GET request with query parameters as the backend expects
                try {
                    const response = await api.get(`/api/car-insurance/vehicles/${vehicleId}/calculate_premium/`, {
                        params: {
                            coverage_type: calculationData.coverage_type,
                            driver_age: calculationData.driver_age,
                            claims_history: calculationData.claims_history,
                            no_claims_years: calculationData.no_claims_years
                        }
                    });
                    result = response.data;
                    
                    // Enhance result with local calculations
                    const coverage = getCoverageDetails(calculationData.coverage_type);
                    result.coverage_details = coverage;
                    result.liability_limit = coverage.maxLiability;
                    
                    // Add passenger cover if selected
                    if (calculationData.include_passenger_cover) {
                        const passengerCoverPremium = result.final_premium * 0.15;
                        result.final_premium += passengerCoverPremium;
                        result.passenger_cover_premium = Math.round(passengerCoverPremium);
                        
                        if (!result.breakdown) result.breakdown = {};
                        if (!result.breakdown.notes) result.breakdown.notes = [];
                        result.breakdown.notes.push("passenger_cover_included");
                    }
                    
                } catch (apiError) {
                    console.log('API calculation failed, using local calculation');
                    result = calculatePremiumLocally();
                }
            } else {
                result = calculatePremiumLocally();
            }
            
            setPremiumResult(result);
            setErrors({});
        } catch (error) {
            console.error('Error calculating premium:', error);
            
            try {
                const localResult = calculatePremiumLocally();
                setPremiumResult(localResult);
                setErrors({});
            } catch (localError) {
                setErrors({ general: 'Failed to calculate premium. Please check your inputs.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuote = async () => {
        const vehicleId = getVehicleId();
        
        if (!vehicle || !vehicleId || !premiumResult) {
            setErrors({ general: 'Valid vehicle information is required to create a quote' });
            return;
        }
        
        setCreatingQuote(true);
        setErrors({});
        
        try {
            // FIX: Changed claims_history to claims_history
            const quoteData = {
                coverage_type: calculationData.coverage_type,
                driver_age: calculationData.driver_age,
                claims_history: calculationData.claims_history, // FIXED HERE
                no_claims_years: calculationData.no_claims_years,
                premium_amount: premiumResult.final_premium,
                duration_days: calculationData.duration_days
            };

            console.log('Creating quote with data:', quoteData);
            
            const response = await api.post(`/api/car-insurance/vehicles/${vehicleId}/create_quote/`, quoteData);
            
            console.log('Quote created successfully:', response.data);
            
            if (onQuoteCreated) {
                onQuoteCreated(response.data);
            }
            
            alert('Insurance quote created successfully!');
            
        } catch (error) {
            console.error('Error creating quote:', error);
            
            let errorMessage = 'Failed to create quote. Please try again.';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                }
            }
            
            setErrors({ general: errorMessage });
        } finally {
            setCreatingQuote(false);
        }
    };

    // Calculate short-term premium
    const calculateShortTermPremium = () => {
        if (!premiumResult) return 0;
        
        const annualPremium = premiumResult.final_premium;
        const days = calculationData.duration_days;
        
        if (calculationData.coverage_type === 'third_party') {
            if (days <= 15) return annualPremium * 0.125;
            if (days <= 30) return annualPremium * 0.25;
            if (days <= 90) return annualPremium * 0.40;
            if (days <= 180) return annualPremium * 0.60;
            if (days <= 240) return annualPremium * 0.80;
            return annualPremium;
        } else {
            if (days <= 15) return annualPremium * 0.15;
            if (days <= 30) return annualPremium * 0.30;
            if (days <= 90) return annualPremium * 0.50;
            if (days <= 180) return annualPremium * 0.70;
            if (days <= 240) return annualPremium * 0.85;
            return annualPremium;
        }
    };

    // Render vehicle warning
    const renderVehicleWarning = () => {
        const vehicleId = getVehicleId();
        if (vehicle && !vehicleId) {
            return (
                <div className="warning-message">
                    ⚠️ Warning: Vehicle data is incomplete. Cannot calculate premium.
                    <br />
                    <small>Please select a different vehicle or contact support.</small>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="premium-calculator">
            <div className="calculator-header">
                <h2>
                    {vehicle ? `Premium Calculator - ${vehicle.make} ${vehicle.model}` : 'Premium Calculator'}
                </h2>
                <button className="close-btn" onClick={onCancel}>×</button>
            </div>
            
            {renderVehicleWarning()}
            
            {errors.general && (
                <div className="error-message">{errors.general}</div>
            )}
            
            <div className="calculator-content">
                {/* Vehicle Info Section */}
                {vehicle && (
                    <div className="vehicle-info-section">
                        <div className="vehicle-card-summary">
                            <div className="vehicle-icon">🚗</div>
                            <div className="vehicle-details">
                                <h3>{vehicle.make} {vehicle.model}</h3>
                                <p>{vehicle.year} • {vehicle.license_plate}</p>
                                <div className="vehicle-specs">
                                    <span>{vehicle.vehicle_type}</span>
                                    <span>•</span>
                                    <span>{vehicle.engine_size}L {vehicle.fuel_type}</span>
                                    <span>•</span>
                                    <span>$ {parseFloat(vehicle.current_value).toLocaleString()}</span>
                                </div>
                                <div className="vehicle-id">
                                    <small>Vehicle ID: {getVehicleId() || 'Not available'}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Calculation Parameters */}
                <div className="calculation-params">
                    <h3>Calculation Parameters</h3>
                    
                    <div className="params-grid">
                        <div className="param-group">
                            <label>Coverage Type *</label>
                            <select
                                name="coverage_type"
                                value={calculationData.coverage_type}
                                onChange={handleChange}
                                className={errors.coverage_type ? 'error' : ''}
                            >
                                <option value="third_party">Third Party Only</option>
                                <option value="third_party_fire_theft">Third Party Fire & Theft</option>
                                <option value="comprehensive">Comprehensive</option>
                            </select>
                            <small className="field-info">
                                {getCoverageDetails(calculationData.coverage_type).description}
                            </small>
                        </div>
                        
                        <div className="param-group">
                            <label>Driver Age *</label>
                            <input
                                type="number"
                                name="driver_age"
                                value={calculationData.driver_age}
                                onChange={handleChange}
                                min="18"
                                max="80"
                                className={errors.driver_age ? 'error' : ''}
                            />
                            {errors.driver_age && <span className="field-error">{errors.driver_age}</span>}
                        </div>
                        
                        <div className="param-group">
                            <label>Previous Claims (Last 5 years)</label>
                            <input
                                type="number"
                                name="claims_history"
                                value={calculationData.claims_history}
                                onChange={handleChange}
                                min="0"
                                max="10"
                                className={errors.claims_history ? 'error' : ''}
                            />
                            {errors.claims_history && <span className="field-error">{errors.claims_history}</span>}
                        </div>
                        
                        <div className="param-group">
                            <label>No-Claim Years</label>
                            <input
                                type="number"
                                name="no_claims_years"
                                value={calculationData.no_claims_years}
                                onChange={handleChange}
                                min="0"
                                max="50"
                                className={errors.no_claims_years ? 'error' : ''}
                            />
                            {errors.no_claims_years && <span className="field-error">{errors.no_claims_years}</span>}
                            <small className="field-info">Max 50% discount for 10+ years</small>
                        </div>
                        
                        <div className="param-group">
                            <label>Coverage Duration (days)</label>
                            <input
                                type="number"
                                name="duration_days"
                                value={calculationData.duration_days}
                                onChange={handleChange}
                                min="1"
                                max="365"
                                className={errors.duration_days ? 'error' : ''}
                            />
                            {errors.duration_days && <span className="field-error">{errors.duration_days}</span>}
                        </div>
                        
                        <div className="param-group full-width">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="include_passenger_cover"
                                    checked={calculationData.include_passenger_cover}
                                    onChange={handleChange}
                                />
                                Include Passenger & Driver Cover (+15%)
                            </label>
                            <small className="checkbox-note">
                                Covers death/permanent disability up to $ 600 per person
                            </small>
                        </div>
                    </div>
                    
                    <button 
                        className="btn-calculate"
                        onClick={handleCalculate}
                        disabled={loading}
                    >
                        {loading ? 'Calculating...' : 'Calculate Premium'}
                    </button>
                </div>
                
                {/* Premium Results */}
                {premiumResult && (
                    <div className="premium-results">
                        <h3>Premium Calculation Results</h3>
                        
                        {/* Coverage Details */}
                        <div className="coverage-details">
                            <h4>{premiumResult.coverage_details?.name || 'Insurance Coverage'}</h4>
                            <p>{premiumResult.coverage_details?.description || ''}</p>
                            
                            <div className="coverage-features">
                                {premiumResult.coverage_details?.coversVehicleDamage && (
                                    <span className="feature-tag">✓ Vehicle Damage</span>
                                )}
                                {premiumResult.coverage_details?.coversTheft && (
                                    <span className="feature-tag">✓ Theft Cover</span>
                                )}
                                {premiumResult.coverage_details?.coversFire && (
                                    <span className="feature-tag">✓ Fire Cover</span>
                                )}
                                <span className="feature-tag">✓ Third Party Liability</span>
                                {calculationData.include_passenger_cover && (
                                    <span className="feature-tag highlight">✓ Passenger Cover</span>
                                )}
                            </div>
                            
                            <div className="liability-info">
                                <small>Third Party Liability Limit: <strong>$ 600</strong></small>
                            </div>
                        </div>
                        
                        {/* Premium Summary */}
                        <div className="results-summary">
                            <div className="result-card total-premium">
                                <div className="result-label">Total Annual Premium</div>
                                <div className="result-value">
                                    $ {premiumResult.final_premium?.toLocaleString() || '0'}
                                </div>
                                <div className="result-note">Per year</div>
                            </div>
                            
                            <div className="result-card short-term-premium">
                                <div className="result-label">Short-Term Premium</div>
                                <div className="result-value">
                                    $ {calculateShortTermPremium().toLocaleString()}
                                </div>
                                <div className="result-note">
                                    For {calculationData.duration_days} days
                                </div>
                            </div>
                            
                            <div className="result-card excess">
                                <div className="result-label">Excess Amount</div>
                                <div className="result-value">
                                    $ {premiumResult.excess_amount?.toLocaleString() || '500'}
                                </div>
                                <div className="result-note">Per claim</div>
                            </div>
                        </div>
                        
                        {/* Premium Breakdown */}
                        <div className="premium-breakdown">
                            <h4>Premium Breakdown</h4>
                            <div className="breakdown-grid">
                                {premiumResult.base_premium && (
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">Base Premium:</span>
                                        <span className="breakdown-value">$ {premiumResult.base_premium.toLocaleString()}</span>
                                    </div>
                                )}
                                
                                {premiumResult.breakdown?.age_factor > 1 && (
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">Age Factor:</span>
                                        <span className="breakdown-value">
                                            {premiumResult.breakdown.age_factor.toFixed(2)}x
                                        </span>
                                    </div>
                                )}
                                
                                {premiumResult.breakdown?.claims_factor > 1 && (
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">Claims Factor:</span>
                                        <span className="breakdown-value">
                                            {premiumResult.breakdown.claims_factor.toFixed(2)}x
                                        </span>
                                    </div>
                                )}
                                
                                {premiumResult.discount_amount > 0 && (
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">No-Claim Discount:</span>
                                        <span className="breakdown-value discount">
                                            -$ {premiumResult.discount_amount.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                
                                {premiumResult.passenger_cover_premium > 0 && (
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">Passenger Cover:</span>
                                        <span className="breakdown-value">
                                            +$ {premiumResult.passenger_cover_premium.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="breakdown-item total">
                                    <span className="breakdown-label">Final Premium:</span>
                                    <span className="breakdown-value">$ {premiumResult.final_premium.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            {/* Calculation Notes */}
                            {premiumResult.breakdown?.notes && premiumResult.breakdown.notes.length > 0 && (
                                <div className="calculation-notes">
                                    <h5>Calculation Notes:</h5>
                                    <ul>
                                        {premiumResult.breakdown.notes.map((note, index) => (
                                            <li key={index}>
                                                {note.replace(/_/g, ' ')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {/* Coverage Specific Notes */}
                            <div className="coverage-notes">
                                {calculationData.coverage_type === 'comprehensive' && (
                                    <div className="note-item">
                                        <strong>Comprehensive Coverage Notes:</strong>
                                        <ul>
                                            <li>Total loss declared at 75% of vehicle value</li>
                                            <li>Maximum 20% annual depreciation</li>
                                            <li>Partial loss depreciation applies based on vehicle age</li>
                                        </ul>
                                    </div>
                                )}
                                
                                {calculationData.include_passenger_cover && (
                                    <div className="note-item">
                                        <strong>Passenger Cover Notes:</strong>
                                        <ul>
                                            <li>Maximum coverage: $ 600 per person</li>
                                            <li>Covers death and permanent disability</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        {vehicle && (
                            <div className="calculator-actions">
                                <button 
                                    className="btn-secondary"
                                    onClick={() => setPremiumResult(null)}
                                >
                                    Recalculate
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={handleCreateQuote}
                                    disabled={creatingQuote}
                                >
                                    {creatingQuote ? 'Creating Quote...' : 'Create Insurance Quote'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Information Panel */}
                {!premiumResult && (
                    <div className="info-panel">
                        <h4>💡 Insurance Coverage Types</h4>
                        <div className="info-content">
                            <div className="coverage-type-info">
                                <h5>1. Third Party Only</h5>
                                <p>Minimum legal requirement. Covers:</p>
                                <ul>
                                    <li>Third party injury/death (up to $ 600)</li>
                                    <li>Third party property damage</li>
                                    <li><strong>Does NOT cover</strong> your vehicle damage</li>
                                </ul>
                                
                                <h5>2. Third Party Fire & Theft</h5>
                                <p>Third party coverage plus:</p>
                                <ul>
                                    <li>Fire damage to your vehicle</li>
                                    <li>Theft of your vehicle</li>
                                </ul>
                                
                                <h5>3. Comprehensive</h5>
                                <p>Complete protection including:</p>
                                <ul>
                                    <li>All third party coverage</li>
                                    <li>Accidental damage to your vehicle</li>
                                    <li>Fire, theft, and natural disasters</li>
                                    <li>Optional passenger cover add-on</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremiumCalculator;