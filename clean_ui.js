const fs = require('fs');
const path = require('path');

const files = [
  'app/components/Navbar.tsx',
  'app/components/PostCard.tsx',
  'app/components/BookCard.tsx',
  'app/components/ImageCard.tsx',
  'app/components/UnifiedUploadForm.tsx',
  'app/components/LoginForm.tsx',
  'app/components/RegisterForm.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx'
];

files.forEach(file => {
  const filePath = path.join('/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci', file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove SVG Noise blocks (multiline)
  content = content.replace(/\s*{\/\* (?:SVG Noise Grain Texture.*?|Background Noise & Glow) \*\/}\s*<div[^>]*mix-blend-screen[^>]*style={{ backgroundImage:[^}]+}}[^>]*>(?:<\/div>)?/gs, '');
  content = content.replace(/\s*<div[^>]*mix-blend-screen[^>]*style={{ backgroundImage:[^}]+}}[^>]*>(?:<\/div>)?/gs, '');
  
  // Clean up extreme drop shadows
  content = content.replace(/\s*drop-shadow-\[[^\]]+\]/g, '');
  
  // Simplify extreme inner/outer shadows to shadow-sm or shadow-lg
  content = content.replace(/\s*shadow-\[inset_[^\]]+\]/g, ' shadow-inner');
  content = content.replace(/\s*shadow-\[[^\]]+\]/g, ' shadow-lg');
  
  // Simplify backgrounds and blurs
  content = content.replace(/bg-\[#[0-9a-fA-F]+\]\/[0-9]+/g, 'bg-black/40');
  content = content.replace(/bg-\[#[0-9a-fA-F]+\]/g, 'bg-black');
  content = content.replace(/backdrop-blur-\[[0-9]+px\]/g, 'backdrop-blur-xl');
  
  fs.writeFileSync(filePath, content);
  console.log('Cleaned:', file);
});
