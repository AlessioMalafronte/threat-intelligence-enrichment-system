// Usage: node hash_gen.js <password>
const bcrypt = require('bcryptjs');

const password = process.argv[2];                       // password passata da riga di comando
if (!password) {
    console.error('Usage: node hash_gen.js <password>');
    process.exit(1);
}

bcrypt.hash(password, 10)                               // 10 salt rounds
    .then(hash => console.log('Password hash:', hash))
    .catch(err => { console.error('Hash error:', err); process.exit(1); });