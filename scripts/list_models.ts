const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function main() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
  const data = await res.json();
  console.log(data.models.map((m: any) => m.name).join('\n'));
}

main().catch(console.error);
