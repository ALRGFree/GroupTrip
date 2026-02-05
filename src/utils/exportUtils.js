/**
 * Export utilities for GroupTrip
 * Handles PDF generation and calendar file exports
 */

import jsPDF from 'jspdf';
import { formatDate, formatTime, formatDateTime } from './dateUtils';

/**
 * Generate PDF of trip itinerary
 * @param {Object} group - Group information
 * @param {Array} events - Itinerary events
 * @param {Array} members - Group members
 * @param {Object} options - Export options
 * @returns {Blob} PDF blob
 */
export async function generateItineraryPDF(group, events, members, options = {}) {
  const {
    includeMembers = true,
    includeFlights = true,
    includeAccommodations = true,
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Helper to add new page if needed
  const checkPageBreak = (height = 20) => {
    if (yPos + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with word wrap
  const addWrappedText = (text, x, maxWidth, lineHeight = 6) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach(line => {
      checkPageBreak(lineHeight);
      doc.text(line, x, yPos);
      yPos += lineHeight;
    });
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(group.name || 'Trip Itinerary', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Destination and dates
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  if (group.destination) {
    doc.text(group.destination, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  if (group.startDate && group.endDate) {
    const dateRange = `${formatDate(group.startDate)} - ${formatDate(group.endDate)}`;
    doc.setFontSize(12);
    doc.text(dateRange, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
  }

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Members section
  if (includeMembers && members && members.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Travelers', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    members.forEach(member => {
      checkPageBreak(8);
      const memberText = `• ${member.name}${member.email ? ` (${member.email})` : ''}`;
      doc.text(memberText, margin + 5, yPos);
      yPos += 6;
    });

    yPos += 10;
  }

  // Itinerary events section
  if (events && events.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Itinerary', margin, yPos);
    yPos += 10;

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.datetime) - new Date(b.datetime)
    );

    // Group by date
    const groupedEvents = {};
    sortedEvents.forEach(event => {
      const dateKey = formatDate(event.datetime, 'yyyy-MM-dd');
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });

    Object.entries(groupedEvents).forEach(([dateKey, dayEvents]) => {
      checkPageBreak(20);

      // Date header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos - 4, pageWidth - margin * 2, 8, 'F');
      doc.text(formatDate(dateKey, 'EEEE, MMMM d, yyyy'), margin + 2, yPos);
      yPos += 10;

      // Events for this day
      doc.setFontSize(10);
      dayEvents.forEach(event => {
        checkPageBreak(20);

        doc.setFont('helvetica', 'bold');
        const time = formatTime(event.datetime);
        doc.text(time, margin + 5, yPos);

        doc.setFont('helvetica', 'normal');
        doc.text(event.title, margin + 35, yPos);
        yPos += 5;

        if (event.location) {
          doc.setTextColor(100, 100, 100);
          doc.text(`📍 ${event.location}`, margin + 35, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 5;
        }

        if (event.description) {
          doc.setTextColor(80, 80, 80);
          addWrappedText(event.description, margin + 35, pageWidth - margin * 2 - 35, 4);
          doc.setTextColor(0, 0, 0);
        }

        yPos += 5;
      });

      yPos += 5;
    });
  }

  // Flight information section
  if (includeFlights && members) {
    const allFlights = members.flatMap(m =>
      (m.flights || []).map(f => ({ ...f, memberName: m.name }))
    ).filter(f => f.flightNumber);

    if (allFlights.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Flight Information', margin, yPos);
      yPos += 10;

      doc.setFontSize(9);
      allFlights.forEach(flight => {
        checkPageBreak(25);

        doc.setFont('helvetica', 'bold');
        doc.text(`${flight.memberName}`, margin + 5, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.text(
          `${flight.airline || ''} ${flight.flightNumber} | ${flight.departureAirport || ''} → ${flight.arrivalAirport || ''}`,
          margin + 10, yPos
        );
        yPos += 4;

        if (flight.departureTime) {
          doc.text(`Departs: ${formatDateTime(flight.departureTime)}`, margin + 10, yPos);
          yPos += 4;
        }
        if (flight.arrivalTime) {
          doc.text(`Arrives: ${formatDateTime(flight.arrivalTime)}`, margin + 10, yPos);
          yPos += 4;
        }

        yPos += 5;
      });
    }
  }

  // Accommodation section
  if (includeAccommodations && members) {
    const allAccommodations = members.flatMap(m =>
      (m.accommodations || []).map(a => ({ ...a, memberName: m.name }))
    ).filter(a => a.hotelName);

    if (allAccommodations.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Accommodations', margin, yPos);
      yPos += 10;

      doc.setFontSize(9);
      allAccommodations.forEach(acc => {
        checkPageBreak(25);

        doc.setFont('helvetica', 'bold');
        doc.text(acc.hotelName, margin + 5, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        if (acc.address) {
          doc.text(`📍 ${acc.address}`, margin + 10, yPos);
          yPos += 4;
        }
        if (acc.checkIn && acc.checkOut) {
          doc.text(
            `${formatDate(acc.checkIn)} - ${formatDate(acc.checkOut)}`,
            margin + 10, yPos
          );
          yPos += 4;
        }
        if (acc.confirmationNumber) {
          doc.text(`Confirmation: ${acc.confirmationNumber}`, margin + 10, yPos);
          yPos += 4;
        }

        yPos += 5;
      });
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by GroupTrip | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * Download PDF
 * @param {Blob} blob - PDF blob
 * @param {string} filename - Filename without extension
 */
export function downloadPDF(blob, filename = 'itinerary') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate ICS calendar file content
 * @param {Array} events - Events to export
 * @param {Object} group - Group information
 * @returns {string} ICS file content
 */
export function generateICS(events, group) {
  const formatICSDate = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const escapeICS = (text) => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@grouptrip`;

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GroupTrip//Group Travel Coordination//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(group?.name || 'Trip Itinerary')}`,
  ];

  events.forEach(event => {
    const startDate = formatICSDate(event.datetime);
    // Default to 1 hour duration if no end time
    const endDate = event.endDatetime
      ? formatICSDate(event.endDatetime)
      : formatICSDate(new Date(new Date(event.datetime).getTime() + 60 * 60 * 1000));

    icsContent = icsContent.concat([
      'BEGIN:VEVENT',
      `UID:${uid()}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${escapeICS(event.title)}`,
      event.location ? `LOCATION:${escapeICS(event.location)}` : null,
      event.description ? `DESCRIPTION:${escapeICS(event.description)}` : null,
      event.category ? `CATEGORIES:${escapeICS(event.category)}` : null,
      'END:VEVENT',
    ].filter(Boolean));
  });

  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
}

/**
 * Download ICS calendar file
 * @param {string} icsContent - ICS file content
 * @param {string} filename - Filename without extension
 */
export function downloadICS(icsContent, filename = 'itinerary') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL for an event
 * @param {Object} event - Event object
 * @returns {string} Google Calendar URL
 */
export function getGoogleCalendarUrl(event) {
  const formatGoogleDate = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const startDate = formatGoogleDate(event.datetime);
  const endDate = event.endDatetime
    ? formatGoogleDate(event.endDatetime)
    : formatGoogleDate(new Date(new Date(event.datetime).getTime() + 60 * 60 * 1000));

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || '',
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Apple Calendar URL for an event
 * @param {Object} event - Event object
 * @returns {string} Apple Calendar URL (webcal protocol)
 */
export function getAppleCalendarUrl(event) {
  // Apple Calendar uses ICS files with webcal protocol
  const icsContent = generateICS([event], {});
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  return URL.createObjectURL(blob);
}

/**
 * Export trip summary as JSON (for backup/sharing)
 * @param {Object} data - All trip data
 * @returns {string} JSON string
 */
export function exportTripJSON(data) {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    ...data,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Download JSON file
 * @param {string} jsonContent - JSON content
 * @param {string} filename - Filename without extension
 */
export function downloadJSON(jsonContent, filename = 'trip-backup') {
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      console.error('Copy failed:', e);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export default {
  generateItineraryPDF,
  downloadPDF,
  generateICS,
  downloadICS,
  getGoogleCalendarUrl,
  getAppleCalendarUrl,
  exportTripJSON,
  downloadJSON,
  copyToClipboard,
};
