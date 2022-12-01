const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const crypto = require('crypto');
const rl = readline.createInterface({ input, output });
const fs = require('fs');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCA7rdxs01lwHzfr3';

function encryptFile(filename) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    try {
        const file = fs.readFileSync(filename);
    } catch (err) {
        console.log("\x1b[41m%s\x1b[0m", 'File not found');
        process.exit();
    }
    const encrypted = Buffer.concat([cipher.update(fs.readFileSync(filename)), cipher.final()]);
    fs.writeFileSync(__dirname + "/output/" + filename + '.drmdec', JSON.stringify({
        content: encrypted.toString('hex')
    }));
    console.log("\x1b[31m", "+-------------------------------------------------------");
    console.log(" | Key Hash 1: " + iv.toString('hex'));
    console.log(' | File encrypted successfully');
    console.log(" +-------------------------------------------------------");
    fs.writeFileSync(__dirname + "/output/" + filename + '.key', iv.toString('hex'));
    console.log("\x1b[0m");
}
function decryptFile(filename, hash) {
    try {
        const file = JSON.parse(fs.readFileSync(filename + ".drmdec"));
    } catch (err) {
        console.log("\x1b[41m%s\x1b[0m", 'Invalid file');
        process.exit();
    }
    const file = JSON.parse(fs.readFileSync(filename + ".drmdec"));
    const iv = Buffer.from(hash, 'hex');
    const encryptedText = Buffer.from(file.content, 'hex');

    try {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    } catch (e) {
        console.log("\x1b[41m%s\x1b[0m", 'Wrong key');
        return;
    }
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

    fs.writeFileSync(__dirname + "/output/" + filename.replace('.drmdec', ''), decrypted);
    console.log("\x1b[32m", 'File decrypted successfully');
}

if (process.argv[2] == '-e') {
    if (process.argv[3] == '-f') {
        return encryptFile(process.argv[4]);
    } else {
        rl.question('Enter file name: ', (filename) => {
            rl.close();
            return encryptFile(filename);
        });
    }

} else if (process.argv[2] == '-d') {
    if (process.argv[3] == '-f') {
        decryptFile(process.argv[4], process.argv[5]);
    } else {
        rl.question('Enter file name: ', (filename) => {
            rl.question('Enter key hash: ', (hash) => {
                rl.close();
                return decryptFile(filename, hash);

            });
        });
    }

} else {
    fs.readFile("lib/asci.txt", 'utf8', function (err, data) {
        if (err) throw err;
        console.log(data);
        console.log("[1] Encrypt File");
        console.log("[2] Decrypt File");
    });

    rl.question('Select an option: ', (answer) => {
        if (answer == 1) {
            rl.question('Enter the file path: ', (answer) => {
                encryptFile(answer);
                rl.close();
            });
        } else if (answer == 2) {
            let filename;
            let hash;
            rl.question('Enter the file path (Without .drmdec): ', (answer) => {
                filename = answer;
                rl.question('Enter the KEY: ', (answer) => {
                    hash = answer;
                    decryptFile(filename, hash);
                    rl.close();
                });
            });
        } else {
            console.log("\x1b[41m%s\x1b[0m", 'Invalid option');
            process.exit();
        }
    });
}





