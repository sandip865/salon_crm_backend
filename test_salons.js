const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOGY4ZDg3NDMwZjQxNGFjZDQwMzQ1ZSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTc4NzgyNTAxNSwiZXhwIjoxNzg3OTExNDE1fQ.QxbPo3cZIUf6MhFcjUse93d67BalmSStkpXRnP58Kx8';

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/salons/my-salons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const text = await res.text();
    console.log(res.status);
    console.log(text);
  } catch (err) {
    console.error(err);
  }
}
test();
