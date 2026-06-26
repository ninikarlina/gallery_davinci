const fs = require('fs');
const files = [
  '/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci/app/api/posts/[id]/comments/route.ts',
  '/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci/app/api/books/[id]/comments/route.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the destructuring to include parentId
    content = content.replace(
      /const \{ text \} = await req\.json\(\);/,
      'const { text, parentId } = await req.json();'
    );
    
    // Add parentId to prisma.comment.create
    content = content.replace(
      /content: text,[\s\S]*?(postId: id,|bookId: id,)/,
      match => match + '\n        parentId: parentId || null,'
    );
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
