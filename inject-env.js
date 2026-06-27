const fs = require('fs');
const path = require('path');

// Read env variables from Vercel, fallback to default credentials if not set
const sbUrl = process.env.SUPABASE_URL || 'https://uryssoojjljplseaxamn.supabase.co';
const sbKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNzb29qamxqcGxzZWF4YW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjE0NjgsImV4cCI6MjA5Nzg5NzQ2OH0.VmSSd3_7we4ZNOcHSaklHAN05Bnx9dCiTHjY_UI7c_k';

const files = [
    path.join(__dirname, 'assets/js/app.js'),
    path.join(__dirname, 'admin/index.html')
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Find and replace the API URL and Key
        content = content.replace(/https:\/\/uryssoojjljplseaxamn\.supabase\.co/g, sbUrl);
        content = content.replace(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNzb29qamxqcGxzZWF4YW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjE0NjgsImV4cCI6MjA5Nzg5NzQ2OH0\.VmSSd3_7we4ZNOcHSaklHAN05Bnx9dCiTHjY_UI7c_k/g, sbKey);
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Successfully injected environment variables into: ${file}`);
    } else {
        console.warn(`File not found to inject variables: ${file}`);
    }
});
