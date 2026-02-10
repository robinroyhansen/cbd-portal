const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Finnish translations...\n');

// Test 1: Check if Finnish locale file exists and is valid
try {
  const fiFile = path.join(__dirname, 'locales', 'fi.json');
  const fiContent = fs.readFileSync(fiFile, 'utf8');
  const fiData = JSON.parse(fiContent);
  
  console.log('✅ Finnish locale file exists and is valid JSON');
  console.log(`📊 File size: ${(fiContent.length / 1024).toFixed(1)}KB`);
  console.log(`🔑 Top-level keys: ${Object.keys(fiData).length}`);
  
  // Test 2: Check specific translation keys
  const testKeys = [
    'meta.siteName',
    'nav.healthTopics', 
    'toolsPage.title',
    'toolsPage.dosageCalculatorTitle',
    'common.search'
  ];
  
  console.log('\n🔍 Testing key translation paths:');
  testKeys.forEach(keyPath => {
    const value = keyPath.split('.').reduce((obj, key) => obj && obj[key], fiData);
    if (value) {
      console.log(`✅ ${keyPath}: "${value}"`);
    } else {
      console.log(`❌ ${keyPath}: MISSING`);
    }
  });
  
  // Test 3: Check for English fallbacks (should not exist in FI file)
  const suspiciousKeys = [];
  function findEnglishText(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'string') {
        // Check for common English words that shouldn't be in Finnish
        const englishWords = ['cannabis', 'evidence-based', 'cbd portal', 'tools', 'calculator'];
        const hasEnglish = englishWords.some(word => 
          value.toLowerCase().includes(word) && 
          !value.toLowerCase().includes('cbd') // Allow CBD as it's universal
        );
        if (hasEnglish) {
          suspiciousKeys.push({ path: currentPath, value });
        }
      } else if (typeof value === 'object' && value !== null) {
        findEnglishText(value, currentPath);
      }
    }
  }
  
  findEnglishText(fiData);
  
  console.log('\n🔍 Checking for potential untranslated content:');
  if (suspiciousKeys.length > 0) {
    console.log(`⚠️  Found ${suspiciousKeys.length} potentially untranslated strings:`);
    suspiciousKeys.slice(0, 5).forEach(item => {
      console.log(`   ${item.path}: "${item.value}"`);
    });
    if (suspiciousKeys.length > 5) {
      console.log(`   ... and ${suspiciousKeys.length - 5} more`);
    }
  } else {
    console.log('✅ No obvious English text found in Finnish translations');
  }
  
  // Test 4: Check route translations
  console.log('\n🛣️  Testing middleware route translations:');
  const middlewareFile = fs.readFileSync(path.join(__dirname, 'middleware.ts'), 'utf8');
  const hasFinishRoutes = middlewareFile.includes("'fi'") && middlewareFile.includes('tyokalut');
  console.log(`${hasFinishRoutes ? '✅' : '❌'} Finnish routes in middleware: ${hasFinishRoutes}`);
  
  // Test 5: Check tools page structure
  if (fiData.toolsPage) {
    const toolsKeys = Object.keys(fiData.toolsPage);
    const requiredToolKeys = ['title', 'subtitle', 'dosageCalculatorTitle', 'useThisTool'];
    const missingKeys = requiredToolKeys.filter(key => !toolsKeys.includes(key));
    
    console.log('\n🔧 Tools page translation status:');
    if (missingKeys.length === 0) {
      console.log('✅ All required tools page keys present');
      console.log(`📊 Total tools translation keys: ${toolsKeys.length}`);
    } else {
      console.log(`❌ Missing required keys: ${missingKeys.join(', ')}`);
    }
  }
  
} catch (error) {
  console.log(`❌ Error testing Finnish translations: ${error.message}`);
}

console.log('\n🏁 Finnish translation test complete!');