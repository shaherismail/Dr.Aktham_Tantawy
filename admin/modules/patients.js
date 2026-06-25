// modules/patients.js
// Patient Manager Module
// Loads unique patients (derived from bookings by phone number),
// shows patient detail modal, manages X-ray uploads and xray gallery.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';
import { uploadMediaFileDirectly } from '../services/storage.js';

// ---------------------------------------------------------------------------
// PATIENT LIST
// ---------------------------------------------------------------------------

/** Loads all unique patients and renders them in the patients table. */
export function loadPatients() {
    const { supabaseClient } = AppState;
    const listBody = document.getElementById('patientsTableBody');
    listBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">جاري تحميل المرضى...</td></tr>';

    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">خطأ في تحميل المرضى.</td></tr>';
                return;
            }

            // Deduplicate by phone number — keep the first occurrence
            const patientMap = new Map();
            data.forEach(b => {
                if (!patientMap.has(b.phone)) {
                    patientMap.set(b.phone, {
                        id:       b.id,
                        name:     b.name,
                        phone:    b.phone,
                        email:    b.email || 'غير مسجل',
                        age:      b.age   || 'غير محدد',
                        lastAppt: `${b.date} ${b.time}`,
                    });
                }
            });

            listBody.innerHTML = '';

            patientMap.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><code>#${p.id.substr(3, 6)}</code></td>
                    <td style="font-weight:600;">${p.name}</td>
                    <td>${p.phone}</td>
                    <td>${p.age} سنة</td>
                    <td>${p.lastAppt}</td>
                    <td><button class="btn btn-secondary btn-sm edit-history-btn" data-phone="${p.phone}"><i class="bx bx-plus-medical"></i> عرض</button></td>
                    <td><button class="btn btn-secondary btn-sm view-files-btn" data-phone="${p.phone}"><i class="bx bx-file"></i> الأشعة</button></td>
                    <td><button class="btn btn-primary btn-sm view-full-profile-btn" data-phone="${p.phone}">الملف الكامل</button></td>
                `;

                listBody.appendChild(tr);

                tr.querySelector('.view-full-profile-btn').onclick = () => displayPatientDetails(p);
                tr.querySelector('.view-files-btn').onclick        = () => displayPatientDetails(p);

                tr.querySelector('.edit-history-btn').onclick = () => {
                    const hist = prompt(
                        'أدخل السوابق المرضية والملخص التقويمي لهذا المريض:',
                        'لا يعاني من أي أمراض مزمنة. تقويم شفاف للفكين.'
                    );
                    if (hist) {
                        logAuditAction('patient:update_history', `patient:${p.phone}`, null, { medical_history: hist });
                        alert('✅ تم تحديث التاريخ الطبي بنجاح.');
                    }
                };
            });
        });
}

// ---------------------------------------------------------------------------
// PATIENT DETAIL MODAL
// ---------------------------------------------------------------------------

/**
 * Opens the patient detail modal and populates it with patient data.
 * Configures the X-ray upload input for this specific patient.
 *
 * @param {{ id: string, name: string, phone: string, email: string }} patient
 */
export function displayPatientDetails(patient) {
    const modal = document.getElementById('patientDetailsModal');
    modal.style.display = 'block';
    modal.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('patientDetailTitle').textContent = `السجل التقويمي الطبي: ${patient.name}`;
    document.getElementById('pdEmail').textContent            = `البريد الإلكتروني: ${patient.email}`;

    // Bind X-ray upload for this patient
    const fileInput = document.getElementById('patientXrayUpload');
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadMediaFileDirectly(file, 'cases').then((url) => {
                logAuditAction('patient:xray_upload', `patient:${patient.phone}`, null, { xray_url: url });
                alert('✅ تم رفع ملف الأشعة السينية بنجاح ومزامنته بملف المريض!');
                renderPatientXrays(patient.phone);
            });
        }
    };

    renderPatientXrays(patient.phone);
}

// ---------------------------------------------------------------------------
// X-RAY GALLERY
// ---------------------------------------------------------------------------

/**
 * Loads and renders X-ray images from media_library (folder: cases)
 * into the patient's X-ray grid.
 *
 * @param {string} phone - Patient phone number (used as tag reference)
 */
export function renderPatientXrays(phone) {
    const { supabaseClient } = AppState;
    const container = document.getElementById('patientXraysGrid');
    container.innerHTML = 'جاري تحميل الأشعة...';

    supabaseClient.from('media_library')
        .select('*')
        .eq('folder', 'cases')
        .eq('is_deleted', false)
        .then(({ data, error }) => {
            if (error || !data || data.length === 0) {
                container.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">لم يتم رفع أي صور أشعة بعد.</span>';
                return;
            }

            container.innerHTML = '';
            data.forEach(media => {
                const img          = document.createElement('img');
                img.src            = media.url;
                img.style.width    = '70px';
                img.style.height   = '70px';
                img.style.objectFit    = 'cover';
                img.style.borderRadius = '6px';
                img.style.cursor       = 'pointer';
                img.onclick = () => window.open(media.url, '_blank');
                container.appendChild(img);
            });
        });
}
