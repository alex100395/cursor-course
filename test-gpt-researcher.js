// Test GitHub Summarizer with gpt-researcher repository
const testGPTResearcher = async () => {
  const baseUrl = 'http://localhost:5001';
  const testRepo = 'https://github.com/assafelovic/gpt-researcher';
  
  console.log('🧪 Testing GitHub Summarizer');
  console.log(`Repository: ${testRepo}\n`);

  // You need to create an API key first through the UI at http://localhost:5001
  // Then replace 'YOUR_API_KEY' with your actual API key
  const testApiKey = process.argv[2] || 'YOUR_API_KEY';

  if (testApiKey === 'YOUR_API_KEY') {
    console.log('⚠️  Usage: node test-gpt-researcher.js YOUR_API_KEY');
    console.log('   Create an API key at http://localhost:5001 first\n');
    return;
  }

  console.log('Sending request...\n');
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/api/github-summarizer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testApiKey,
      },
      body: JSON.stringify({ githubUrl: testRepo }),
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Duration: ${duration}s\n`);
    
    if (response.ok) {
      console.log('✅ SUCCESS!\n');
      console.log('='.repeat(80));
      console.log('SUMMARY:');
      console.log('='.repeat(80));
      console.log(data.summary || 'No summary provided');
      console.log('\n' + '='.repeat(80));
      console.log('COOL FACTS:');
      console.log('='.repeat(80));
      if (data.cool_facts && Array.isArray(data.cool_facts)) {
        data.cool_facts.forEach((fact, index) => {
          console.log(`${index + 1}. ${fact}`);
        });
      } else {
        console.log('No cool facts provided');
      }
      console.log('='.repeat(80));
    } else {
      console.log('❌ Error Response:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.error(error);
  }
};

testGPTResearcher().catch(console.error);
