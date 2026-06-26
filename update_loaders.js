const fs = require('fs');

function updateFeedPage() {
  const file = 'app/feed/page.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Import GoldDoodleLoader
  if (!content.includes('GoldDoodleLoader')) {
    content = content.replace(
      "import { Heart, Search, Filter, Loader2, Sparkles, Book, PenTool, ImageIcon, AlertCircle } from 'lucide-react';",
      "import { Heart, Search, Filter, Loader2, Sparkles, Book, PenTool, ImageIcon, AlertCircle } from 'lucide-react';\nimport GoldDoodleLoader from '@/app/components/GoldDoodleLoader';"
    );
  }

  // Replace primary loading
  content = content.replace(
    /<div className="flex justify-center py-20">\s*<Loader2 className="w-8 h-8 text-white\/40 animate-spin" \/>\s*<\/div>/,
    '<div className="flex justify-center py-32">\n            <GoldDoodleLoader />\n          </div>'
  );

  // Replace secondary loading
  content = content.replace(
    /\{loadingMore && <Loader2 className="w-6 h-6 text-white\/40 animate-spin" \/>\}/,
    '{loadingMore && <GoldDoodleLoader text="" />}'
  );

  fs.writeFileSync(file, content);
  console.log('Updated app/feed/page.tsx');
}

function updateUnifiedUploadForm() {
  const file = 'app/components/UnifiedUploadForm.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // UnifiedUploadForm has a submit button with Loader2:
  // {loading ? (
  //   <>
  //     <Loader2 className="w-5 h-5 animate-spin" />
  //     <span className="">Memproses...</span>
  //   </>

  // Let's import GoldDoodleLoader if we want, but wait, a doodle in a button might be too big. 
  // Maybe the doodle is better suited for full page loading. I will leave the upload form button alone, or just use the doodle without text.
}

updateFeedPage();
