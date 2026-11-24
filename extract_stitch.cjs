const fs = require('fs');
const path = require('path');

const steps = {
  'screen_1_dashboard.html': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/23/output.txt',
  'screen_2_calendar.html': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/29/output.txt',
  'screen_3_reminders.html': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/31/output.txt',
  'screen_4_help_chat.html': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/35/output.txt',
  'screen_5_map_routes.html': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/37/output.txt'
};

fs.mkdirSync('stitch_reference', { recursive: true });
for (const [file, p] of Object.entries(steps)) {
  const content = fs.readFileSync(p, 'utf8');
  const data = JSON.parse(content);
  fs.writeFileSync(path.join('stitch_reference', file), data.html || '', 'utf8');
}
console.log('Stitch reference HTML files saved successfully!');
