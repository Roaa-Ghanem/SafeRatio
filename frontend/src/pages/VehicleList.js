import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/car/vehicles/');
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading vehicles...</div>;

    return (
        <div className="vehicle-list">
            <div className="page-header">
                <h1>My Vehicles</h1>
                <button className="btn-primary">Add Vehicle</button>
            </div>

            <div className="vehicles-grid">
                {vehicles.length === 0 ? (
                    <div className="empty-state">
                        <h3>No vehicles added yet</h3>
                        <p>Add your first vehicle to get insurance quotes</p>
                        <button className="btn-primary">Add First Vehicle</button>
                    </div>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle.id} className="vehicle-card">
                            <div className="vehicle-header">
                                <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                                <span className="vehicle-type">{vehicle.vehicle_type}</span>
                            </div>
                            <div className="vehicle-details">
                                <p><strong>License Plate:</strong> {vehicle.license_plate}</p>
                                <p><strong>VIN:</strong> {vehicle.vin}</p>
                                <p><strong>Current Value:</strong> ${vehicle.current_value}</p>
                                <p><strong>Fuel Type:</strong> {vehicle.fuel_type}</p>
                            </div>
                            <div className="vehicle-actions">
                                <button className="btn-secondary">Get Quote</button>
                                <button className="btn-outline">Edit</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VehicleList;