import React, { useState, useMemo } from 'react';
import {
  Calendar,
  List,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Clock,
  MapPin,
  Tag,
  Download,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Utensils,
  Camera,
  Users,
  Coffee,
  Landmark,
  PartyPopper,
  MoreVertical,
} from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import { Layout } from '../components/Layout';
import { FormModal } from '../components/Modal';
import { NoEventsEmpty } from '../components/EmptyState';
import { useConfirmDialog } from '../components/ConfirmDialog';
import { Avatar } from '../components/Avatar';
import { EventCountdown } from '../components/CountdownTimer';
import {
  formatDate,
  formatTime,
  groupByDate,
  sortByDate,
  getDaysInRange,
  isToday,
  isSameDay,
  toDatetimeLocal,
  parseISO,
} from '../utils/dateUtils';
import {
  generateItineraryPDF,
  downloadPDF,
  generateICS,
  downloadICS,
} from '../utils/exportUtils';
import { generateId } from '../utils/helpers';

const CATEGORIES = [
  { id: 'meal', label: 'Meal', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
  { id: 'activity', label: 'Activity', icon: Camera, color: 'bg-blue-100 text-blue-700' },
  { id: 'meeting', label: 'Meeting Point', icon: Users, color: 'bg-purple-100 text-purple-700' },
  { id: 'sightseeing', label: 'Sightseeing', icon: Landmark, color: 'bg-green-100 text-green-700' },
  { id: 'coffee', label: 'Coffee/Drinks', icon: Coffee, color: 'bg-amber-100 text-amber-700' },
  { id: 'event', label: 'Event', icon: PartyPopper, color: 'bg-pink-100 text-pink-700' },
  { id: 'other', label: 'Other', icon: Tag, color: 'bg-gray-100 text-gray-700' },
];

export default function Itinerary() {
  const { currentGroup, events, members, addEvent, updateEvent, deleteEvent, duplicateEvent } = useGroup();
  const { confirm, DialogComponent } = useConfirmDialog();

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    datetime: '',
    endDatetime: '',
    location: '',
    description: '',
    category: 'activity',
  });

  // Grouped and sorted events
  const groupedEvents = useMemo(() => {
    const sorted = sortByDate(events, 'datetime');
    return groupByDate(sorted, 'datetime');
  }, [events]);

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    // Pad to start of week
    const startDay = start.getDay();
    start.setDate(start.getDate() - startDay);

    // Pad to end of week
    const endDay = end.getDay();
    end.setDate(end.getDate() + (6 - endDay));

    return getDaysInRange(start, end);
  }, [selectedDate]);

  const eventsOnSelectedDate = useMemo(() => {
    return events.filter(e => isSameDay(parseISO(e.datetime), selectedDate));
  }, [events, selectedDate]);

  const resetForm = () => {
    setFormData({
      title: '',
      datetime: '',
      endDatetime: '',
      location: '',
      description: '',
      category: 'activity',
    });
    setEditingEvent(null);
    setError('');
  };

  const openAddModal = (date = null) => {
    resetForm();
    if (date) {
      const dateStr = toDatetimeLocal(date);
      setFormData(prev => ({ ...prev, datetime: dateStr }));
    }
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      datetime: event.datetime ? toDatetimeLocal(event.datetime) : '',
      endDatetime: event.endDatetime ? toDatetimeLocal(event.endDatetime) : '',
      location: event.location || '',
      description: event.description || '',
      category: event.category || 'activity',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!formData.datetime) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const eventData = {
        title: formData.title.trim(),
        datetime: new Date(formData.datetime).toISOString(),
        endDatetime: formData.endDatetime ? new Date(formData.endDatetime).toISOString() : null,
        location: formData.location.trim(),
        description: formData.description.trim(),
        category: formData.category,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete',
    });

    if (confirmed) {
      await deleteEvent(eventId);
    }
  };

  const handleDuplicate = async (eventId) => {
    await duplicateEvent(eventId);
  };

  const handleExportPDF = async () => {
    setShowExportMenu(false);
    const blob = await generateItineraryPDF(currentGroup, events, members);
    downloadPDF(blob, `${currentGroup?.name || 'trip'}-itinerary`);
  };

  const handleExportICS = () => {
    setShowExportMenu(false);
    const ics = generateICS(events, currentGroup);
    downloadICS(ics, `${currentGroup?.name || 'trip'}-itinerary`);
  };

  const getCategoryConfig = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  if (!currentGroup) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Please select a trip first</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Itinerary</h1>
            <p className="text-gray-600 mt-1">
              {events.length} events planned
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
            </div>

            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn-secondary btn-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={handleExportPDF}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button
                      onClick={handleExportICS}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Export to Calendar
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Add Event */}
            <button onClick={() => openAddModal()} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          /* List View */
          events.length === 0 ? (
            <NoEventsEmpty onAddEvent={() => openAddModal()} />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      isToday(dateKey)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isToday(dateKey) ? 'Today' : formatDate(dateKey, 'EEEE')}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(dateKey, 'MMMM d, yyyy')}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                    {sortByDate(dayEvents, 'datetime').map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        categoryConfig={getCategoryConfig(event.category)}
                        onEdit={() => openEditModal(event)}
                        onDelete={() => handleDelete(event.id)}
                        onDuplicate={() => handleDuplicate(event.id)}
                        members={members}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Calendar View */
          <div className="card">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {formatDate(selectedDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayEvents = events.filter(e => isSameDay(parseISO(e.datetime), day));
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] p-1 rounded-lg border transition-colors text-left ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-transparent hover:bg-gray-50'
                      } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-sm rounded-full ${
                        isTodayDate
                          ? 'bg-primary-600 text-white font-medium'
                          : 'text-gray-700'
                      }`}>
                        {day.getDate()}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((event) => {
                          const cat = getCategoryConfig(event.category);
                          return (
                            <div
                              key={event.id}
                              className={`text-[10px] px-1 py-0.5 rounded truncate ${cat.color}`}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-gray-500 px-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Events */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  {formatDate(selectedDate, 'EEEE, MMMM d')}
                </h3>
                <button
                  onClick={() => openAddModal(selectedDate)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add event
                </button>
              </div>
              {eventsOnSelectedDate.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No events scheduled for this day
                </p>
              ) : (
                <div className="space-y-2">
                  {sortByDate(eventsOnSelectedDate, 'datetime').map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => openEditModal(event)}
                    >
                      <div className={`w-2 h-2 rounded-full ${getCategoryConfig(event.category).color.split(' ')[0]}`} />
                      <span className="text-sm text-gray-500">{formatTime(event.datetime)}</span>
                      <span className="text-sm font-medium text-gray-900">{event.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        title={editingEvent ? 'Edit Event' : 'Add Event'}
        submitText={editingEvent ? 'Save Changes' : 'Add Event'}
        loading={loading}
      >
        {error && (
          <div className="mb-4 p-3 bg-danger-50 text-danger-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Group dinner at..."
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors ${
                      formData.category === cat.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.datetime}
                onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDatetime}
                onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
                min={formData.datetime}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where is this happening?"
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any details..."
              className="input min-h-[80px]"
            />
          </div>
        </div>
      </FormModal>

      <DialogComponent />
    </Layout>
  );
}

// Event Card Component
function EventCard({ event, categoryConfig, onEdit, onDelete, onDuplicate, members }) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = categoryConfig.icon;
  const creator = members.find(m => m.userId === event.createdBy);

  return (
    <div className="card p-4 ml-4 relative">
      {/* Timeline dot */}
      <div className={`absolute -left-[25px] top-4 w-4 h-4 rounded-full border-2 border-white ${categoryConfig.color.split(' ')[0]}`} />

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryConfig.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(event.datetime)}
                {event.endDatetime && ` - ${formatTime(event.endDatetime)}`}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EventCountdown event={event} compact />

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicate();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-danger-50 text-danger-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {event.description && (
        <p className="mt-3 text-sm text-gray-600 pl-13">{event.description}</p>
      )}

      {creator && (
        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-gray-500">
          <Avatar name={creator.name} size="xs" />
          <span>Added by {creator.name}</span>
        </div>
      )}
    </div>
  );
}
