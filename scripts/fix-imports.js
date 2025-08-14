#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapping of old imports to new imports
const importMappings = {
  '@/utils/supabase/client': '@/lib/supabaseClient',
  '@/utils/supabase/server': '@/lib/supabaseServer',
  '@/lib/supabaseAdmin': '@/lib/supabaseServer',
  '@/utils/r2/client': '@/lib/r2',
  '@/utils/image': '@/lib/imageUtils',
  '@/utils/images': '@/lib/imageUtils',
  '@/utils/imageOptimization': '@/lib/imageUtils',
};

// Function mappings for changed function names
const functionMappings = {
  // Supabase
  'createClient() from @/utils/supabase/server': 'createServerClient()',
  'createClient() from @/utils/supabase/client': 'createClient()',
  'supabaseAdmin from @/lib/supabaseAdmin': 'createAdminClient()',

  // R2
  'uploadFileToR2 from @/utils/r2/client': 'uploadFileToR2',
  'deleteFileFromR2 from @/utils/r2/client': 'deleteFileFromR2',
  'deleteMultipleFilesFromR2 from @/utils/r2/client': 'deleteMultipleFilesFromR2',
  'r2Client from @/utils/r2/client': 'r2',

  // Images
  'getFirstValidImage from @/utils/image': 'getFirstValidImage',
  'isValidImageUrl from @/utils/image': 'isValidImageUrl',
  'preloadImage from @/utils/imageOptimization': 'preloadImage',
};

function findFiles(dir, extension) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .next, and other build directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          traverse(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith(extension) || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix import statements
  for (const [oldImport, newImport] of Object.entries(importMappings)) {
    const regex = new RegExp(
      `(import\\s+(?:{[^}]*}|[^{\\s]+|\\*\\s+as\\s+\\w+)\\s+from\\s+['"])${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`,
      'g'
    );

    if (regex.test(content)) {
      content = content.replace(regex, `$1${newImport}$2`);
      modified = true;
      console.log(`📝 Fixed import in ${filePath}: ${oldImport} → ${newImport}`);
    }
  }

  // Fix specific function call patterns

  // supabaseAdmin → createAdminClient()
  if (content.includes('supabaseAdmin') && content.includes('@/lib/supabaseServer')) {
    content = content.replace(/supabaseAdmin/g, 'createAdminClient()');
    modified = true;
    console.log(`📝 Fixed supabaseAdmin usage in ${filePath}`);
  }

  // createClient from server → createServerClient
  if (content.includes('createClient') && content.includes('@/lib/supabaseServer')) {
    content = content.replace(/await createClient\(\)/g, 'await createServerClient()');
    content = content.replace(/createClient\(\)/g, 'createServerClient()');
    modified = true;
    console.log(`📝 Fixed createClient usage in ${filePath}`);
  }

  // Fix dynamic imports
  content = content.replace(
    /await import\(['"]@\/lib\/supabaseAdmin['"]\)/g,
    "await import('@/lib/supabaseServer')"
  );

  // Fix component-specific issues
  if (filePath.includes('ImageGallery.tsx')) {
    // Fix undefined 'error' variable
    content = content.replace(/\{error\}/g, '{imageError}');
    content = content.replace(/\(loading \|\| error\)/g, '(loading || imageError)');
    content = content.replace(/error &&/g, 'imageError &&');

    // Add missing state
    if (!content.includes('const [imageError')) {
      const stateRegex = /(const \[loading[^\]]*\];)/;
      if (stateRegex.test(content)) {
        content = content.replace(stateRegex, '$1\n  const [imageError, setImageError] = useState(false);');
        modified = true;
      }
    }
  }

  // Fix Award import issue
  if (content.includes('Award') && !content.includes('import') && content.includes('Award className')) {
    content = content.replace(/<Award className/g, '<div className');
    content = content.replace(/<\/Award>/g, '</div>');
    modified = true;
    console.log(`📝 Fixed Award component in ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function main() {
  console.log('🔧 Starting import path fixes...\n');

  const projectRoot = process.cwd();
  const srcDir = path.join(projectRoot, 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found. Make sure you are in the project root.');
    process.exit(1);
  }

  // Find all TypeScript and JavaScript files
  const files = [
    ...findFiles(srcDir, '.ts'),
    ...findFiles(srcDir, '.tsx'),
    ...findFiles(srcDir, '.js'),
    ...findFiles(srcDir, '.jsx'),
  ];

  console.log(`📂 Found ${files.length} files to process...\n`);

  let fixedFiles = 0;

  for (const file of files) {
    try {
      if (fixImportsInFile(file)) {
        fixedFiles++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Import fix complete!`);
  console.log(`📊 Fixed ${fixedFiles} files out of ${files.length} total files.`);

  // Additional specific fixes for catalog page
  const catalogPagePath = path.join(srcDir, 'app', 'catalog', 'page.tsx');
  if (fs.existsSync(catalogPagePath)) {
    let content = fs.readFileSync(catalogPagePath, 'utf8');

    // Fix searchParams type issue
    if (content.includes('searchParams: Record<string, string | string[] | undefined>')) {
      content = content.replace(
        'searchParams: Record<string, string | string[] | undefined>',
        'searchParams: Promise<Record<string, string | string[] | undefined>>'
      );

      content = content.replace(
        'await fetchCatalogData(searchParams)',
        'await fetchCatalogData(await searchParams)'
      );

      fs.writeFileSync(catalogPagePath, content, 'utf8');
      console.log('📝 Fixed searchParams Promise type in catalog page');
    }
  }

  console.log('\n🎉 All import fixes applied successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run: pnpm typecheck');
  console.log('   2. Fix any remaining type errors manually');
  console.log('   3. Test the application');
}

if (require.main === module) {
  main();
}

module.exports = { fixImportsInFile, importMappings };
