import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadAppointments, saveAppointments, loadReminders, saveReminders } from './storage';
import { AppointmentItem, ReminderItem } from '../types';

describe('Appointment Management & Lifecycle Tests', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };

    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  it('creates and persists a doctor appointment with doctor, specialty, date, and location', () => {
    const newApp: AppointmentItem = {
      id: 'app-cardio-1',
      doctorOrService: 'Dr. Ramesh Sharma',
      specialty: 'हृदय रोग विशेषज्ञ (Cardiologist)',
      date: 'कल (Tomorrow)',
      time: '11:00 AM',
      location: 'Max Healthcare, Saket',
      status: 'upcoming',
      notes: 'Blood test reports from last week to be shown.',
    };

    saveAppointments([newApp]);

    const loaded = loadAppointments();
    expect(loaded.length).toBe(1);
    expect(loaded[0].doctorOrService).toBe('Dr. Ramesh Sharma');
    expect(loaded[0].specialty).toContain('Cardiologist');
    expect(loaded[0].time).toBe('11:00 AM');
    expect(loaded[0].location).toBe('Max Healthcare, Saket');
    expect(loaded[0].status).toBe('upcoming');
  });

  it('edits an appointment and updates time, doctor, and notes', () => {
    const app: AppointmentItem = {
      id: 'app-edit-1',
      doctorOrService: 'Dr. Anita Gupta',
      specialty: 'नेत्र रोग (Eye Specialist)',
      date: 'सोमवार (Monday)',
      time: '10:30 AM',
      location: 'Vision Eye Center',
      status: 'upcoming',
    };

    saveAppointments([app]);

    // Action: Edit appointment to new time and add notes
    const updatedApp: AppointmentItem = {
      ...app,
      time: '11:30 AM',
      notes: 'Dilating eye drops needed, daughter to accompany.',
    };

    saveAppointments([updatedApp]);

    const reloaded = loadAppointments();
    expect(reloaded[0].time).toBe('11:30 AM');
    expect(reloaded[0].notes).toContain('Dilating eye drops');
  });

  it('deletes an appointment and verifies it is removed from persistent storage', () => {
    const app1: AppointmentItem = {
      id: 'app-1',
      doctorOrService: 'Dr. A',
      specialty: 'General',
      date: 'Today',
      time: '09:00 AM',
      location: 'Clinic 1',
      status: 'upcoming',
    };
    const app2: AppointmentItem = {
      id: 'app-2',
      doctorOrService: 'Dr. B',
      specialty: 'Dental',
      date: 'Next Week',
      time: '04:00 PM',
      location: 'Clinic 2',
      status: 'upcoming',
    };

    saveAppointments([app1, app2]);
    expect(loadAppointments().length).toBe(2);

    // Delete app1
    const remaining = loadAppointments().filter((a) => a.id !== 'app-1');
    saveAppointments(remaining);

    const reloaded = loadAppointments();
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].id).toBe('app-2');
  });

  it('creates and attaches a reminder from an appointment item', () => {
    const app: AppointmentItem = {
      id: 'app-rem-1',
      doctorOrService: 'Dr. Verma',
      specialty: 'Orthopedic',
      date: 'कल',
      time: '05:00 PM',
      location: 'City Hospital',
      status: 'upcoming',
    };

    // User triggers "Reminder लगाएँ" from Appointment card
    const reminder: ReminderItem = {
      id: `rem-${app.id}`,
      title: `Doctor: ${app.doctorOrService}`,
      titleHi: `डॉक्टर: ${app.doctorOrService}`,
      time: app.time,
      timeLabel: app.time,
      timeLabelHi: 'शाम 5:00 बजे',
      category: 'doctor',
      completed: false,
    };

    saveReminders([reminder]);

    const loadedReminders = loadReminders();
    expect(loadedReminders.length).toBe(1);
    expect(loadedReminders[0].id).toBe('rem-app-rem-1');
    expect(loadedReminders[0].title).toBe('Doctor: Dr. Verma');
    expect(loadedReminders[0].category).toBe('doctor');
    expect(loadedReminders[0].completed).toBe(false);
  });

  it('persists doctor visit checklist checked items in localStorage across sessions', () => {
    const checklistKey = 'saathi_doctor_checklist_items';
    const checkedState: Record<string, boolean> = {
      'app-1_med_list': true,
      'app-1_old_reports': true,
      'app-1_main_issue': false,
    };

    localStorage.setItem(checklistKey, JSON.stringify(checkedState));

    const retrieved = JSON.parse(localStorage.getItem(checklistKey)!);
    expect(retrieved['app-1_med_list']).toBe(true);
    expect(retrieved['app-1_old_reports']).toBe(true);
    expect(retrieved['app-1_main_issue']).toBe(false);
  });
});
