// Test GitHub Summarizer with specific repository
const testSpecificRepo = async () => {
  const baseUrl = 'http://localhost:5001';
  const testRepo = 'https://github.com/assafelovic/gpt-researcher';
  
  // Note: You'll need to replace this with an actual API key from your Supabase database
  // You can get one by visiting http://localhost:5001 and creating an API key through the UI
  const testApiKey = process.env.TEST_API_KEY || 'YOUR_API_KEY_HERE';

  console.log('🧪 Testing GitHub Summarizer with gpt-researcher repository...\n');
  console.log(`Repository: ${testRepo}\n`);

  if (testApiKey === 'YOUR_API_KEY_HERE') {
    console.log('⚠️  Please set TEST_API_KEY environment variable or update the script with a valid API key');
    console.log('   You can create an API key by visiting http://localhost:5001\n');
    return;
  }

  // Test with POST request
  console.log('Testing POST request...');
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
      console.log('✅ Success!\n');
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

// Run the test
testSpecificRepo().catch(console.error);
