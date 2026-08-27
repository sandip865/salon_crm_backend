const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Add global Mongoose toJSON transform in server.js
const serverPath = path.join(srcDir, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');
if (!serverContent.includes('mongoose.set(\'toJSON\'')) {
  const mongooseConfig = `
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});
`;
  serverContent = serverContent.replace(/mongoose\.connect\([^)]+\)/, `$&;\n${mongooseConfig}`);
  fs.writeFileSync(serverPath, serverContent, 'utf8');
  console.log('Added global toJSON transform to server.js');
}

// 2. Make phone unique in client.model.js
const clientModelPath = path.join(srcDir, 'models', 'client.model.js');
let clientModelContent = fs.readFileSync(clientModelPath, 'utf8');
if (clientModelContent.includes('phone: { type: String }')) {
  clientModelContent = clientModelContent.replace('phone: { type: String }', 'phone: { type: String, unique: true, sparse: true }');
  fs.writeFileSync(clientModelPath, clientModelContent, 'utf8');
  console.log('Made phone unique in client.model.js');
}

// 3. Add success messages to client.controller.js (and others if needed)
const clientCtrlPath = path.join(srcDir, 'controllers', 'client.controller.js');
let clientCtrlContent = fs.readFileSync(clientCtrlPath, 'utf8');
clientCtrlContent = clientCtrlContent.replace(/res\.status\(201\)\.json\(\{ success: true, data: client \}\);/, 
  "res.status(201).json({ success: true, message: 'Client created successfully', data: client });");
clientCtrlContent = clientCtrlContent.replace(/res\.json\(\{ success: true, data: client \}\);/g, 
  "res.json({ success: true, message: 'Client fetched/updated successfully', data: client });");
clientCtrlContent = clientCtrlContent.replace(/res\.json\(\{ success: true, data: result \}\);/, 
  "res.json({ success: true, message: 'Clients fetched successfully', data: result });");
fs.writeFileSync(clientCtrlPath, clientCtrlContent, 'utf8');
console.log('Added success messages to client.controller.js');

// 4. Do the same for other controllers using a simple regex
const controllersDir = path.join(srcDir, 'controllers');
const files = fs.readdirSync(controllersDir);
files.forEach(file => {
  if (file === 'client.controller.js' || !file.endsWith('.controller.js')) return;
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Some controllers already return { success: true, message: '...', data: ... }
  // We can inject a message if it's missing in res.send(result) or res.status(201).send(result)
  // Actually, many services return the message inside `result` (e.g. result = { success: true, message: '...', data: doc })
  // Let's check salon.service.js to confirm.
});
