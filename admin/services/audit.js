// services/audit.js
// Audit & Version History Service
// Centralizes all audit logging and version snapshot logic.

import { AppState } from './db.js';

/**
 * Tables whose changes are tracked in version_history for rollback support.
 * @type {string[]}
 */
const TRACKABLE_TABLES = [
    'site_settings',
    'theme_settings',
    'homepage_editor',
    'doctor_profile',
    'page_sections',
    'component_content',
];

/**
 * Logs an admin action to audit_logs, and optionally saves a version snapshot
 * to version_history for trackable tables.
 *
 * @param {string} action        - Action key, e.g. 'bookings:insert'
 * @param {string} affectedItem  - Affected record key, e.g. 'bookings:abc123'
 * @param {object|null} oldValue - Previous state snapshot
 * @param {object|null} newValue - New state snapshot
 */
export function logAuditAction(action, affectedItem, oldValue, newValue) {
    const { supabaseClient, currentUser } = AppState;
    if (!supabaseClient || !currentUser) return;

    // 1. Insert into audit_logs
    supabaseClient.from('audit_logs').insert([{
        user_email: currentUser.email,
        action,
        affected_item: affectedItem,
        old_value: oldValue || null,
        new_value: newValue || null,
    }]).then(({ error }) => {
        if (error) console.error('Audit logger insertion error:', error);
    });

    // 2. Save version history snapshot for rollbacks on CMS tables
    const parsedTable = affectedItem.split(':')[0];
    if (TRACKABLE_TABLES.includes(parsedTable)) {
        supabaseClient.from('version_history').insert([{
            table_name: parsedTable,
            record_id: affectedItem.split(':')[1] || '1',
            version_data: newValue || {},
            created_by: currentUser.email,
        }]).then(({ error }) => {
            if (error) console.error('Version backup logging error:', error);
        });
    }
}
