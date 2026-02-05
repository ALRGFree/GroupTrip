import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Car,
  Building,
  Plus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { useUser } from '../context/UserContext';
import { Layout } from '../components/Layout';
import { FormModal } from '../components/Modal';
import { AirportAutocomplete, FlightRoute } from '../components/AirportAutocomplete';
import { NoTravelDetailsEmpty } from '../components/EmptyState';
import { ConfirmDialog, useConfirmDialog } from '../components/ConfirmDialog';
import { formatDate, formatTime, formatDateTime, toDatetimeLocal } from '../utils/dateUtils';
import { getAirportByCode } from '../utils/airports';
import { generateId } from '../utils/helpers';

const TABS = [
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'drives', label: 'Drives', icon: Car },
  { id: 'accommodations', label: 'Stays', icon: Building },
];

export default function TravelDetails() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { currentGroup, getCurrentMember, updateMyTravelDetails } = useGroup();
  const { confirm, DialogComponent } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState('flights');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentMember = getCurrentMember();

  // Flight form state
  const [flightData, setFlightData] = useState({
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    departureTime: '',
    arrivalTime: '',
    confirmationNumber: '',
    notes: '',
  });

  // Drive form state
  const [driveData, setDriveData] = useState({
    departureLocation: '',
    arrivalLocation: '',
    departureTime: '',
    estimatedArrival: '',
    vehicleInfo: '',
    passengers: '',
    notes: '',
  });

  // Accommodation form state
  const [accommodationData, setAccommodationData] = useState({
    hotelName: '',
    address: '',
    checkIn: '',
    checkOut: '',
    confirmationNumber: '',
    roomType: '',
    notes: '',
  });

  const resetForms = () => {
    setFlightData({
      airline: '',
      flightNumber: '',
      departureAirport: '',
      arrivalAirport: '',
      departureTime: '',
      arrivalTime: '',
      confirmationNumber: '',
      notes: '',
    });
    setDriveData({
      departureLocation: '',
      arrivalLocation: '',
      departureTime: '',
      estimatedArrival: '',
      vehicleInfo: '',
      passengers: '',
      notes: '',
    });
    setAccommodationData({
      hotelName: '',
      address: '',
      checkIn: '',
      checkOut: '',
      confirmationNumber: '',
      roomType: '',
      notes: '',
    });
    setEditingItem(null);
    setError('');
  };

  const openAddModal = () => {
    resetForms();
    setShowModal(true);
  };

  const openEditModal = (type, item) => {
    setEditingItem({ type, item });

    if (type === 'flights') {
      setFlightData({
        airline: item.airline || '',
        flightNumber: item.flightNumber || '',
        departureAirport: item.departureAirport || '',
        arrivalAirport: item.arrivalAirport || '',
        departureTime: item.departureTime ? toDatetimeLocal(item.departureTime) : '',
        arrivalTime: item.arrivalTime ? toDatetimeLocal(item.arrivalTime) : '',
        confirmationNumber: item.confirmationNumber || '',
        notes: item.notes || '',
      });
    } else if (type === 'drives') {
      setDriveData({
        departureLocation: item.departureLocation || '',
        arrivalLocation: item.arrivalLocation || '',
        departureTime: item.departureTime ? toDatetimeLocal(item.departureTime) : '',
        estimatedArrival: item.estimatedArrival ? toDatetimeLocal(item.estimatedArrival) : '',
        vehicleInfo: item.vehicleInfo || '',
        passengers: item.passengers || '',
        notes: item.notes || '',
      });
    } else if (type === 'accommodations') {
      setAccommodationData({
        hotelName: item.hotelName || '',
        address: item.address || '',
        checkIn: item.checkIn?.split('T')[0] || '',
        checkOut: item.checkOut?.split('T')[0] || '',
        confirmationNumber: item.confirmationNumber || '',
        roomType: item.roomType || '',
        notes: item.notes || '',
      });
    }

    setActiveTab(type);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let newItem;
      let currentItems;

      if (activeTab === 'flights') {
        if (!flightData.departureAirport || !flightData.arrivalAirport) {
          setError('Please select departure and arrival airports');
          setLoading(false);
          return;
        }
        newItem = {
          id: editingItem?.item?.id || generateId(),
          ...flightData,
          departureTime: flightData.departureTime ? new Date(flightData.departureTime).toISOString() : null,
          arrivalTime: flightData.arrivalTime ? new Date(flightData.arrivalTime).toISOString() : null,
        };
        currentItems = currentMember?.flights || [];
      } else if (activeTab === 'drives') {
        if (!driveData.departureLocation || !driveData.arrivalLocation) {
          setError('Please enter departure and arrival locations');
          setLoading(false);
          return;
        }
        newItem = {
          id: editingItem?.item?.id || generateId(),
          ...driveData,
          departureTime: driveData.departureTime ? new Date(driveData.departureTime).toISOString() : null,
          estimatedArrival: driveData.estimatedArrival ? new Date(driveData.estimatedArrival).toISOString() : null,
        };
        currentItems = currentMember?.drives || [];
      } else {
        if (!accommodationData.hotelName) {
          setError('Please enter the hotel/accommodation name');
          setLoading(false);
          return;
        }
        newItem = {
          id: editingItem?.item?.id || generateId(),
          ...accommodationData,
          checkIn: accommodationData.checkIn ? new Date(accommodationData.checkIn).toISOString() : null,
          checkOut: accommodationData.checkOut ? new Date(accommodationData.checkOut).toISOString() : null,
        };
        currentItems = currentMember?.accommodations || [];
      }

      let updatedItems;
      if (editingItem) {
        updatedItems = currentItems.map(item =>
          item.id === editingItem.item.id ? newItem : item
        );
      } else {
        updatedItems = [...currentItems, newItem];
      }

      await updateMyTravelDetails(activeTab, updatedItems);
      setShowModal(false);
      resetForms();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, itemId) => {
    const confirmed = await confirm({
      title: 'Delete Travel Details',
      message: 'Are you sure you want to delete this? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
    });

    if (confirmed) {
      const currentItems = currentMember?.[type] || [];
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      await updateMyTravelDetails(type, updatedItems);
    }
  };

  if (!currentGroup || !currentMember) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Please select a trip first</p>
        </div>
      </Layout>
    );
  }

  const flights = currentMember.flights || [];
  const drives = currentMember.drives || [];
  const accommodations = currentMember.accommodations || [];

  return (
    <Layout>
      <div className="p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Travel Details</h1>
          <p className="text-gray-600 mt-1">
            Add your travel information so the group knows your plans
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'flights' ? flights.length :
                         tab.id === 'drives' ? drives.length : accommodations.length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Flights Tab */}
          {activeTab === 'flights' && (
            <>
              {flights.length === 0 ? (
                <NoTravelDetailsEmpty type="flights" onAdd={openAddModal} />
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      onEdit={() => openEditModal('flights', flight)}
                      onDelete={() => handleDelete('flights', flight.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Drives Tab */}
          {activeTab === 'drives' && (
            <>
              {drives.length === 0 ? (
                <NoTravelDetailsEmpty type="drives" onAdd={openAddModal} />
              ) : (
                <div className="space-y-4">
                  {drives.map((drive) => (
                    <DriveCard
                      key={drive.id}
                      drive={drive}
                      onEdit={() => openEditModal('drives', drive)}
                      onDelete={() => handleDelete('drives', drive.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Accommodations Tab */}
          {activeTab === 'accommodations' && (
            <>
              {accommodations.length === 0 ? (
                <NoTravelDetailsEmpty type="accommodations" onAdd={openAddModal} />
              ) : (
                <div className="space-y-4">
                  {accommodations.map((acc) => (
                    <AccommodationCard
                      key={acc.id}
                      accommodation={acc}
                      onEdit={() => openEditModal('accommodations', acc)}
                      onDelete={() => handleDelete('accommodations', acc.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add {activeTab === 'flights' ? 'Flight' : activeTab === 'drives' ? 'Drive' : 'Accommodation'}
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForms();
        }}
        onSubmit={handleSubmit}
        title={editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
        submitText={editingItem ? 'Save Changes' : 'Add'}
        loading={loading}
        size="lg"
      >
        {error && (
          <div className="mb-4 p-3 bg-danger-50 text-danger-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {activeTab === 'flights' && (
          <FlightForm data={flightData} onChange={setFlightData} />
        )}
        {activeTab === 'drives' && (
          <DriveForm data={driveData} onChange={setDriveData} />
        )}
        {activeTab === 'accommodations' && (
          <AccommodationForm data={accommodationData} onChange={setAccommodationData} />
        )}
      </FormModal>

      <DialogComponent />
    </Layout>
  );
}

// Flight Card Component
function FlightCard({ flight, onEdit, onDelete }) {
  const departureAirport = getAirportByCode(flight.departureAirport);
  const arrivalAirport = getAirportByCode(flight.arrivalAirport);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <Plane className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {flight.airline} {flight.flightNumber}
            </p>
            {flight.confirmationNumber && (
              <p className="text-xs text-gray-500">
                Conf: {flight.confirmationNumber}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <FlightRoute from={flight.departureAirport} to={flight.arrivalAirport} className="mb-4" />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Departure</p>
          <p className="font-medium">{formatDateTime(flight.departureTime)}</p>
          {departureAirport && (
            <p className="text-xs text-gray-500">{departureAirport.name}</p>
          )}
        </div>
        <div>
          <p className="text-gray-500 mb-1">Arrival</p>
          <p className="font-medium">{formatDateTime(flight.arrivalTime)}</p>
          {arrivalAirport && (
            <p className="text-xs text-gray-500">{arrivalAirport.name}</p>
          )}
        </div>
      </div>

      {flight.notes && (
        <p className="mt-3 text-sm text-gray-600 border-t pt-3">{flight.notes}</p>
      )}
    </div>
  );
}

// Drive Card Component
function DriveCard({ drive, onEdit, onDelete }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
            <Car className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Driving</p>
            {drive.vehicleInfo && (
              <p className="text-xs text-gray-500">{drive.vehicleInfo}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500">From</p>
          <p className="font-medium">{drive.departureLocation}</p>
        </div>
        <div className="text-gray-300">→</div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">To</p>
          <p className="font-medium">{drive.arrivalLocation}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Departure</p>
          <p className="font-medium">{formatDateTime(drive.departureTime)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">ETA</p>
          <p className="font-medium">{formatDateTime(drive.estimatedArrival)}</p>
        </div>
      </div>

      {drive.notes && (
        <p className="mt-3 text-sm text-gray-600 border-t pt-3">{drive.notes}</p>
      )}
    </div>
  );
}

// Accommodation Card Component
function AccommodationCard({ accommodation, onEdit, onDelete }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
            <Building className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{accommodation.hotelName}</p>
            {accommodation.roomType && (
              <p className="text-xs text-gray-500">{accommodation.roomType}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {accommodation.address && (
        <div className="flex items-start gap-2 mb-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{accommodation.address}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Check-in</p>
          <p className="font-medium">{formatDate(accommodation.checkIn)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Check-out</p>
          <p className="font-medium">{formatDate(accommodation.checkOut)}</p>
        </div>
      </div>

      {accommodation.confirmationNumber && (
        <div className="mt-3 pt-3 border-t text-sm">
          <span className="text-gray-500">Confirmation: </span>
          <span className="font-mono font-medium">{accommodation.confirmationNumber}</span>
        </div>
      )}

      {accommodation.notes && (
        <p className="mt-3 text-sm text-gray-600 border-t pt-3">{accommodation.notes}</p>
      )}
    </div>
  );
}

// Flight Form
function FlightForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Airline</label>
          <input
            type="text"
            value={data.airline}
            onChange={(e) => update('airline', e.target.value)}
            placeholder="e.g., Delta"
            className="input"
          />
        </div>
        <div>
          <label className="label">Flight Number</label>
          <input
            type="text"
            value={data.flightNumber}
            onChange={(e) => update('flightNumber', e.target.value)}
            placeholder="e.g., DL1234"
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AirportAutocomplete
          label="Departure Airport"
          value={data.departureAirport}
          onChange={(code) => update('departureAirport', code)}
          placeholder="From"
          required
        />
        <AirportAutocomplete
          label="Arrival Airport"
          value={data.arrivalAirport}
          onChange={(code) => update('arrivalAirport', code)}
          placeholder="To"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Departure Time</label>
          <input
            type="datetime-local"
            value={data.departureTime}
            onChange={(e) => update('departureTime', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Arrival Time</label>
          <input
            type="datetime-local"
            value={data.arrivalTime}
            onChange={(e) => update('arrivalTime', e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Confirmation Number</label>
        <input
          type="text"
          value={data.confirmationNumber}
          onChange={(e) => update('confirmationNumber', e.target.value)}
          placeholder="Optional"
          className="input"
        />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Any additional details..."
          className="input min-h-[80px]"
        />
      </div>
    </div>
  );
}

// Drive Form
function DriveForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Departure Location</label>
          <input
            type="text"
            value={data.departureLocation}
            onChange={(e) => update('departureLocation', e.target.value)}
            placeholder="Starting point"
            className="input"
          />
        </div>
        <div>
          <label className="label">Arrival Location</label>
          <input
            type="text"
            value={data.arrivalLocation}
            onChange={(e) => update('arrivalLocation', e.target.value)}
            placeholder="Destination"
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Departure Time</label>
          <input
            type="datetime-local"
            value={data.departureTime}
            onChange={(e) => update('departureTime', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Estimated Arrival</label>
          <input
            type="datetime-local"
            value={data.estimatedArrival}
            onChange={(e) => update('estimatedArrival', e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Vehicle Info</label>
        <input
          type="text"
          value={data.vehicleInfo}
          onChange={(e) => update('vehicleInfo', e.target.value)}
          placeholder="e.g., Blue Honda Civic"
          className="input"
        />
      </div>

      <div>
        <label className="label">Passengers</label>
        <input
          type="text"
          value={data.passengers}
          onChange={(e) => update('passengers', e.target.value)}
          placeholder="Who's riding with you?"
          className="input"
        />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Any additional details..."
          className="input min-h-[80px]"
        />
      </div>
    </div>
  );
}

// Accommodation Form
function AccommodationForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Hotel/Accommodation Name *</label>
        <input
          type="text"
          value={data.hotelName}
          onChange={(e) => update('hotelName', e.target.value)}
          placeholder="e.g., Hilton Downtown"
          className="input"
        />
      </div>

      <div>
        <label className="label">Address</label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="Full address"
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Check-in Date</label>
          <input
            type="date"
            value={data.checkIn}
            onChange={(e) => update('checkIn', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Check-out Date</label>
          <input
            type="date"
            value={data.checkOut}
            onChange={(e) => update('checkOut', e.target.value)}
            min={data.checkIn}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Confirmation Number</label>
          <input
            type="text"
            value={data.confirmationNumber}
            onChange={(e) => update('confirmationNumber', e.target.value)}
            placeholder="Optional"
            className="input"
          />
        </div>
        <div>
          <label className="label">Room Type</label>
          <input
            type="text"
            value={data.roomType}
            onChange={(e) => update('roomType', e.target.value)}
            placeholder="e.g., King Suite"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Any additional details..."
          className="input min-h-[80px]"
        />
      </div>
    </div>
  );
}
