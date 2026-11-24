const fs = require('fs');
const path = require('path');

const imgSteps = {
  'screen_1_dashboard.jpg': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/50/output.txt',
  'screen_2_calendar.jpg': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/52/output.txt',
  'screen_3_reminders.jpg': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/54/output.txt',
  'screen_4_help_chat.jpg': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/56/output.txt',
  'screen_5_map_routes.jpg': 'C:/Users/35T1/.gemini/antigravity/brain/2ba73501-5281-4690-affa-4a3532c23f8d/.system_generated/steps/58/output.txt'
};

for (const [file, p] of Object.entries(imgSteps)) {
  const content = fs.readFileSync(p, 'utf8');
  const data = JSON.parse(content);
  if (data.image) {
    fs.writeFileSync(path.join('stitch_reference', file), Buffer.from(data.image, 'base64'));
    console.log(`Saved image: ${file}`);
  }
}
