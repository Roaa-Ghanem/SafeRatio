import React, { useState } from 'react';
import api from '../services/api';
import './VehicleForm.css';

const VehicleForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        vin: '',
        vehicle_type: 'car',
        fuel_type: 'petrol',
        engine_size: '1.6',
        current_value: '10000.00',
        is_commercial: false,
        annual_mileage: '10000'
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.make.trim()) newErrors.make = 'Make is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
            newErrors.year = 'Please enter a valid year';
        }
        if (!formData.license_plate.trim()) newErrors.license_plate = 'License plate is required';
        if (formData.vin.trim() && formData.vin.trim().length < 10) {
                newErrors.vin = 'VIN must be at least 10 characters';
        }
        if (!formData.current_value || parseFloat(formData.current_value) <= 0) {
            newErrors.current_value = 'Please enter a valid value';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
                    // تحضير البيانات للإرسال
            const submissionData = {
                ...formData,
                year: parseInt(formData.year),
                engine_size: parseFloat(formData.engine_size),
                current_value: parseFloat(formData.current_value),
                annual_mileage: parseInt(formData.annual_mileage)
            };
            
            console.log('Sending vehicle data:', submissionData);
            
            const response = await api.post('/api/car-insurance/vehicles/', submissionData);
            
            console.log('Response:', response.data);
            
            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            // تسجيل تفاصيل الخطأ
            if (error.response) {
                console.error('Response error data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
        
            if (error.response?.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ general: 'Failed to add vehicle. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="vehicle-form-modal">
            <div className="vehicle-form-content">
                <div className="form-header">
                    <h2>Add New Vehicle</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>
                
                {errors.general && (
                    <div className="error-messages">{errors.general}</div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3>Basic Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Vehicle Type *</label>
                                    <select
                                        name="vehicle_type"
                                        value={formData.vehicle_type}
                                        onChange={handleChange}
                                        className={errors.vehicle_type ? 'error' : ''}
                                    >
                                        <option value="car">Car</option>
                                        <option value="suv">SUV</option>
                                        <option value="truck">Truck</option>
                                        <option value="motorcycle">Motorcycle</option>
                                    </select>
                                    {errors.vehicle_type && <span className="field-error">{errors.vehicle_type}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>Make *</label>
                                    <input
                                        type="text"
                                        name="make"
                                        value={formData.make}
                                        onChange={handleChange}
                                        placeholder="e.g., Toyota"
                                        className={errors.make ? 'error' : ''}
                                    />
                                    {errors.make && <span className="field-error">{errors.make}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>Model *</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        placeholder="e.g., Camry"
                                        className={errors.model ? 'error' : ''}
                                    />
                                    {errors.model && <span className="field-error">{errors.model}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>Year *</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className={errors.year ? 'error' : ''}
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    {errors.year && <span className="field-error">{errors.year}</span>}
                                </div>
                            </div>
                        </div>
                        
                        {/* Identification */}
                        <div className="form-section">
                            <h3>Identification</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>License Plate *</label>
                                    <input
                                        type="text"
                                        name="license_plate"
                                        value={formData.license_plate}
                                        onChange={handleChange}
                                        placeholder="e.g., ABC-123"
                                        className={errors.license_plate ? 'error' : ''}
                                    />
                                    {errors.license_plate && <span className="field-error">{errors.license_plate}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>VIN *</label>
                                    <input
                                        type="text"
                                        name="vin"
                                        value={formData.vin}
                                        onChange={handleChange}
                                        placeholder="17-character Vehicle Identification Number"
                                        className={errors.vin ? 'error' : ''}
                                    />
                                    {errors.vin && <span className="field-error">{errors.vin}</span>}
                                </div>
                            </div>
                        </div>
                        
                        {/* Technical Details */}
                        <div className="form-section">
                            <h3>Technical Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fuel Type</label>
                                    <select
                                        name="fuel_type"
                                        value={formData.fuel_type}
                                        onChange={handleChange}
                                    >
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Engine Size (L)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.5"
                                        max="10.0"
                                        name="engine_size"
                                        value={formData.engine_size}
                                        onChange={handleChange}
                                        placeholder="e.g., 1.6"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Current Value ($) *</label>
                                    <input
                                        type="number"
                                        step="100"
                                        min="100"
                                        name="current_value"
                                        value={formData.current_value}
                                        onChange={handleChange}
                                        placeholder="e.g., 10000"
                                        className={errors.current_value ? 'error' : ''}
                                    />
                                    {errors.current_value && <span className="field-error">{errors.current_value}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>Annual Mileage (km)</label>
                                    <input
                                        type="number"
                                        step="1000"
                                        min="0"
                                        name="annual_mileage"
                                        value={formData.annual_mileage}
                                        onChange={handleChange}
                                        placeholder="e.g., 10000"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_commercial"
                                            checked={formData.is_commercial}
                                            onChange={handleChange}
                                        />
                                        This is a commercial vehicle
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleForm;