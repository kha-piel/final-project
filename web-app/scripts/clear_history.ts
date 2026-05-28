async function clearHistory() {
  const url = 'https://gdnifezsinailiqckwwh.supabase.co/rest/v1/student_attempts?attempt_id=not.eq.00000000-0000-0000-0000-000000000000';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbmlmZXpzaW5haWxpcWNrd3doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTE1OSwiZXhwIjoyMDk0ODQ3MTU5fQ.NELIVDGaDCC7_IOGNfFzKirn07_CLq9uytOYpBrzwxM';
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (!response.ok) {
      console.error('Failed to clear history:', response.status, await response.text());
    } else {
      console.log('History cleared successfully.');
    }
  } catch (err) {
    console.error(err);
  }
}

clearHistory();
