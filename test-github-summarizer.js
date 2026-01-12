// Test script for GitHub Summarizer
const testGitHubSummarizer = async () => {
  const baseUrl = 'http://localhost:5001';
  const testApiKey = 'test-api-key-12345'; // This needs to exist in Supabase
  const testRepo = 'https://github.com/vercel/next.js'; // Well-known repo for testing

  console.log('🧪 Testing GitHub Summarizer...\n');

  // Test 1: Test without API key
  console.log('Test 1: Request without API key');
  try {
    const response1 = await fetch(`${baseUrl}/api/github-summarizer?githubUrl=${encodeURIComponent(testRepo)}`, {
      method: 'GET',
    });
    const data1 = await response1.json();
    console.log(`Status: ${response1.status}`);
    console.log(`Response:`, JSON.stringify(data1, null, 2));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('\n');

  // Test 2: Test with invalid API key
  console.log('Test 2: Request with invalid API key');
  try {
    const response2 = await fetch(`${baseUrl}/api/github-summarizer?githubUrl=${encodeURIComponent(testRepo)}`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'invalid-key',
      },
    });
    const data2 = await response2.json();
    console.log(`Status: ${response2.status}`);
    console.log(`Response:`, JSON.stringify(data2, null, 2));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('\n');

  // Test 3: Test with valid API key (POST)
  console.log('Test 3: POST request with API key');
  try {
    const response3 = await fetch(`${baseUrl}/api/github-summarizer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': testApiKey,
      },
      body: JSON.stringify({ githubUrl: testRepo }),
    });
    const data3 = await response3.json();
    console.log(`Status: ${response3.status}`);
    console.log(`Response:`, JSON.stringify(data3, null, 2));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log('\n');

  // Test 4: Test with valid API key (GET)
  console.log('Test 4: GET request with API key');
  try {
    const response4 = await fetch(`${baseUrl}/api/github-summarizer?githubUrl=${encodeURIComponent(testRepo)}`, {
      method: 'GET',
      headers: {
        'X-API-Key': testApiKey,
      },
    });
    const data4 = await response4.json();
    console.log(`Status: ${response4.status}`);
    if (response4.ok) {
      console.log('✅ Success!');
      console.log(`Summary: ${data4.summary?.substring(0, 200)}...`);
      console.log(`Cool Facts: ${data4.cool_facts?.length || 0} facts found`);
    } else {
      console.log(`Response:`, JSON.stringify(data4, null, 2));
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

// Run the tests
testGitHubSummarizer().catch(console.error);
