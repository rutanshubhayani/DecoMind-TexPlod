import bcrypt from 'bcrypt';

async function hashPassword() {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);
}

hashPassword();
