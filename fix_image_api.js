const fs = require('fs');

// 1. Fix ImageCard API endpoint
const imageCardPath = '/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci/app/components/ImageCard.tsx';
let cardContent = fs.readFileSync(imageCardPath, 'utf8');
cardContent = cardContent.replace(
  /\`/api\/images\/\$\{image\.id\}\/comments\`/,
  '\`/api/upload/images/${image.id}/comments\`'
);
fs.writeFileSync(imageCardPath, cardContent);

// 2. Fix Image API route to accept parentId
const routePath = '/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci/app/api/upload/images/[id]/comments/route.ts';
if (fs.existsSync(routePath)) {
  let routeContent = fs.readFileSync(routePath, 'utf8');
  
  routeContent = routeContent.replace(
    /const \{ text \} = await req\.json\(\);/,
    'const { text, parentId } = await req.json();'
  );
  
  routeContent = routeContent.replace(
    /content: text,[\s\S]*?imageId: id,/,
    match => match + '\n        parentId: parentId || null,'
  );
  
  fs.writeFileSync(routePath, routeContent);
  console.log('Fixed ImageCard and Image API route.');
}
