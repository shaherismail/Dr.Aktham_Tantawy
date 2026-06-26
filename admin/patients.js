// patients.js
// Patient Manager Module
// Derives unique patients from bookings (keyed by phone), shows patient detail
// modal, handles X-ray upload, and renders the X-ray image gallery.

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { uploadMediaFileDirectly } from './services/storage.js';
import { setTableLoading, setTableError } from './ui/table.js';

// ---------------------------------------------------------------------------
// PATIENT LIST
// ---------------------------------------------------------------------------

/** Loads all unique patients (deduped by phone) into the patients table. */
export function loadPatients() {
    setTableLoading('patientsTableBody', 8);

    AppState.supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .then(({ data, error }) => {
            const listBody = document.getElementById('patientsTableBody');
            if (error || !data) { setTableError('patientsTableBody', 8, 'خطأ في تحميل المرضى.'); return; }

            const patientMap = new Map();
            data.forEach(b => {
                if (!patientMap.has(b.phone)) {
                    patientMap.set(b.phone, {
                        id: b.id, name: b.name, phone: b.phone,
                        email: b.email || 'غير مسجل',
                        age: b.age   || 'غير محدد',
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
                    <td><button class="btn btn-secondary btn-sm history-btn"><i class="bx bx-plus-medical"></i> عرض</button></td>
                    <td><button class="btn btn-secondary btn-sm xray-btn"><i class="bx bx-file"></i> الأشعة</button></td>
                    <td><button class="btn btn-primary btn-sm profile-btn">الملف الكامل</button></td>
                `;
                listBody.appendChild(tr);
                tr.querySelector('.profile-btn').onclick = () => displayPatientDetails(p);
                tr.querySelector('.xray-btn').onclick    = () => displayPatientDetails(p);
                tr.querySelector('.history-btn').onclick = () => {
                    const hist = prompt('أدخل السوابق المرضية لهذا المريض:', 'لا يعاني من أي أمراض مزمنة.');
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
 * Opens the patient detail panel and configures X-ray upload for this patient.
 * @param {{ id: string, name: string, phone: string, email: string }} patient
 */
export function displayPatientDetails(patient) {
    const modal = document.getElementById('patientDetailsModal');
    modal.style.display = 'block';
    modal.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('patientDetailTitle').textContent = `السجل التقويمي الطبي: ${patient.name}`;
    document.getElementById('pdEmail').textContent            = `البريد الإلكتروني: ${patient.email}`;

    document.getElementById('patientXrayUpload').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        uploadMediaFileDirectly(file, 'cases').then((url) => {
            logAuditAction('patient:xray_upload', `patient:${patient.phone}`, null, { xray_url: url });
            alert('✅ تم رفع ملف الأشعة السينية بنجاح!');
            renderPatientXrays(patient.phone);
        });
    };

    renderPatientXrays(patient.phone);
}

// ---------------------------------------------------------------------------
// X-RAY GALLERY
// ---------------------------------------------------------------------------

/**
 * Loads case-folder images from media_library into the X-ray grid.
 * @param {string} phone - Patient phone (used as reference tag)
 */
export function renderPatientXrays(phone) {
    const container = document.getElementById('patientXraysGrid');
    container.innerHTML = 'جاري تحميل الأشعة...';

    AppState.supabaseClient.from('media_library')
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
                const img = document.createElement('img');
                Object.assign(img, { src: media.url });
                Object.assign(img.style, { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' });
                img.onclick = () => window.open(media.url, '_blank');
                container.appendChild(img);
            });
        });
}
