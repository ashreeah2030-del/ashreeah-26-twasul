import { pgTable, serial, text, timestamp, integer, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Admin Users (Principal)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('admin'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teachers
export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(), // WhatsApp linked phone
  nationalId: text('national_id'), // Civil Registry
  specialty: text('specialty'), // Functional Category
  jobTitle: text('job_title'), // Job Title
  discipline: text('discipline'), // Specialty
  level: text('level'), // Educational Stage
  employeeId: text('employee_id'),
  status: text('status').default('active'),
  points: integer('points').default(0),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Circulars (التعاميم)
export const circulars = pgTable('circulars', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').default('عام'), // انضباط ودوام، إشراف ومناوبة، شؤون تعليمية ونور، اختبارات وكنترول، أمن وسلامة، أنشطة وفعاليات، عام
  targetLevel: text('target_level').default('كامل المجمع'),
  targetType: text('target_type').default('all'), // 'all' (جميع الموظفين) or 'selected' (موظفون محددون)
  targetTeacherIds: text('target_teacher_ids'), // JSON array of teacher IDs: "[1, 2, 3]" or null
  attachments: text('attachments'), 
  scheduledAt: timestamp('scheduled_at'),
  status: text('status').default('sent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teacher views/confirmations for circulars
export const circularResponses = pgTable('circular_responses', {
  id: serial('id').primaryKey(),
  circularId: integer('circular_id').references(() => circulars.id).notNull(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  viewedAt: timestamp('viewed_at'),
  confirmedAt: timestamp('confirmed_at'),
});

// Accountability Documents (أوراق المساءلة)
export const accountability = pgTable('accountability', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  title: text('title').notNull(),
  subject: text('subject'),
  details: text('details'),
  attachments: text('attachments'),
  responseText: text('response_text'),
  signatureUrl: text('signature_url'),
  signedAt: timestamp('signed_at'),
  status: text('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Appreciation Letters (خطابات الشكر)
export const appreciationLetters = pgTable('appreciation_letters', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  templateId: text('template_id'),
  reason: text('reason'),
  letterDate: timestamp('letter_date').defaultNow(),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// WhatsApp Logs
export const whatsappLogs = pgTable('whatsapp_logs', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => teachers.id),
  messageType: text('message_type'),
  status: text('status'),
  errorMsg: text('error_msg'),
  sentAt: timestamp('sent_at').defaultNow(),
});

// Motivation & Honoring Domains (مجالات التكريم والتحفيز)
export const motivationDomains = pgTable('motivation_domains', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  points: integer('points').notNull().default(20),
  category: text('category').default('عام'), // تعليمي، إداري، أنشطة ومبادرات، انضباط
  icon: text('icon').default('Star'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Points Log / Granted Points (سجل منح النقاط للموظفين)
export const motivationPoints = pgTable('motivation_points', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  domainId: integer('domain_id').references(() => motivationDomains.id),
  domainTitle: text('domain_title').notNull(),
  points: integer('points').notNull(),
  notes: text('notes'),
  grantedBy: text('granted_by').default('مدير المجمع'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const teachersRelations = relations(teachers, ({ many }) => ({
  circularResponses: many(circularResponses),
  accountabilityDocs: many(accountability),
  appreciationLetters: many(appreciationLetters),
  motivationLogs: many(motivationPoints),
}));

export const circularsRelations = relations(circulars, ({ many }) => ({
  responses: many(circularResponses),
}));

export const accountabilityRelations = relations(accountability, ({ one }) => ({
  teacher: one(teachers, {
    fields: [accountability.teacherId],
    references: [teachers.id],
  }),
}));

export const motivationPointsRelations = relations(motivationPoints, ({ one }) => ({
  teacher: one(teachers, {
    fields: [motivationPoints.teacherId],
    references: [teachers.id],
  }),
  domain: one(motivationDomains, {
    fields: [motivationPoints.domainId],
    references: [motivationDomains.id],
  }),
}));
