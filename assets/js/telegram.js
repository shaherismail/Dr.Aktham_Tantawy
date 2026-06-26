import { AppState, supabaseClient } from './app.js';
import { updatePatientProfilePage } from './profile.js';
import { fireConfettiEffect } from './animations.js';

// Send Real/Simulated Telegram notifications
export function sendTelegramNotification(bookingId) {
    const botToken = localStorage.getItem('tg_bot_token') || '';
    const chatId = localStorage.getItem('tg_chat_id') || '';
    const tgMode = localStorage.getItem('tg_mode') || 'simulated';

    const b = AppState.bookingData;
    const approvalUrl = window.location.origin + window.location.pathname + `?action=confirm_booking&id=${bookingId}`;

    const text = `🔔 *طلب حجز جديد قيد الانتظار!*
    
👤 *اسم المريض:* ${b.name}
📞 *الجوال:* ${b.phone}
🦷 *الخدمة:* ${b.service}
📅 *التاريخ:* ${b.date}
⏰ *الوقت:* ${b.time}
💺 *العيادة:* ${b.chair}
📝 *ملاحظات:* ${b.notes}

يرجى الضغط على الزر أدناه لتأكيد الحجز وتحديث حالة الملف الطبي للمريض فوراً:`;

    // 1. Send Real Message
    if ((tgMode === 'real' || tgMode === 'both') && botToken && chatId) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const body = {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ موافق (تأكيد الحجز)", url: approvalUrl }
                    ]
                ]
            }
        };

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(res => res.json())
        .then(data => {
            console.log('Telegram real notification sent', data);
        })
        .catch(err => {
            console.error('Error sending real Telegram notification', err);
        });
    }

    // 2. Trigger Chat Simulator
    if (tgMode === 'simulated' || tgMode === 'both') {
        const simulator = document.getElementById('tgSimulatorWidget');
        if (simulator) {
            const badge = document.getElementById('tgSimBadge');
            if (badge) {
                badge.textContent = '1';
                badge.style.display = 'flex';
            }

            const messagesContainer = document.getElementById('tgSimMessages');
            if (messagesContainer) {
                const botMsg = document.createElement('div');
                botMsg.className = 'tg-msg tg-msg-bot';
                
                botMsg.innerHTML = `
                    🔔 <strong>طلب حجز جديد قيد الانتظار!</strong>
                    <div class="tg-booking-details-box">
                        <div class="tg-detail-line"><span class="tg-detail-lbl">المريض:</span><span class="tg-detail-val">${b.name}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">الجوال:</span><span class="tg-detail-val">${b.phone}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">الخدمة:</span><span class="tg-detail-val">${b.service}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">التاريخ:</span><span class="tg-detail-val">${b.date}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">الوقت:</span><span class="tg-detail-val">${b.chair} - ${b.time}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">ملاحظات:</span><span class="tg-detail-val">${b.notes}</span></div>
                    </div>
                    <div class="tg-msg-actions">
                        <button class="tg-action-btn approve-btn" data-booking-id="${bookingId}"><i class="bx bx-check"></i> موافق</button>
                        <button class="tg-action-btn reject-btn" data-booking-id="${bookingId}"><i class="bx bx-x"></i> رفض</button>
                    </div>
                `;

                messagesContainer.appendChild(botMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                botMsg.querySelector('.approve-btn').addEventListener('click', () => {
                    executeSimulatedConfirm(bookingId);
                });
                botMsg.querySelector('.reject-btn').addEventListener('click', () => {
                    botMsg.remove();
                    alert('تم رفض طلب الحجز.');
                });

                try {
                    if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance("طلب حجز جديد قيد المراجعة");
                        utterance.lang = "ar-SA";
                        speechSynthesis.speak(utterance);
                    }
                } catch(e) {
                    console.log('Speech synthesis failed', e);
                }
            }
        }
    }
}

// Execute confirmation through the simulator
export function executeSimulatedConfirm(bookingId) {
    let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
        bookings[idx].status = 'confirmed';
        localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));
    }

    if (supabaseClient) {
        supabaseClient.from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId)
            .then(({ error }) => {
                if (error) console.error('Supabase update error:', error);
                else console.log(`Supabase booking ${bookingId} confirmed.`);
            });
    }

    updatePatientProfilePage();

    const badge = document.getElementById('tgSimBadge');
    if (badge) badge.style.display = 'none';

    window.location.href = 'profile';
    fireConfettiEffect();
}

export function initTelegramSimulator() {
    const launcher = document.getElementById('tgSimLauncher');
    const closeBtn = document.getElementById('tgSimClose');
    const chatbox = document.getElementById('tgSimChatbox');

    if (!launcher || !chatbox) return;

    launcher.addEventListener('click', () => {
        chatbox.classList.toggle('active');
        const badge = document.getElementById('tgSimBadge');
        if (badge) badge.style.display = 'none';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatbox.classList.remove('active');
        });
    }
}

// Auto-run layout binder
document.addEventListener('DOMContentLoaded', () => {
    initTelegramSimulator();
});
