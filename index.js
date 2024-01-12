const readline = require("readline");
const crypto = require("crypto");
const fs = require("fs");

const algorithm = "aes-256-ctr";
const secretKey = "vOVH6sdmpNWjRRIqCA7rdxs01lwHzfr3";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function readFileSyncOrExit(filename) {
  try {
    return fs.readFileSync(filename);
  } catch (err) {
    console.log("\x1b[41m%s\x1b[0m", "File not found");
    process.exit();
  }
}

function writeFileAndPrintMessage(outputFilename, content, message) {
  fs.writeFileSync(outputFilename, content);
  console.log(
    "\x1b[31m",
    `+-------------------------------------------------------`
  );
  console.log(message);
  console.log(" +-------------------------------------------------------");
  console.log("\x1b[0m");
}

function encryptFile(filename, text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const content = filename
    ? readFileSyncOrExit(filename)
    : Buffer.from(text, "utf8");
  const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
  const outputFilename = `${__dirname}/output/${
    filename || "encrypted_text"
  }.drmdec`;

  writeFileAndPrintMessage(
    outputFilename,
    JSON.stringify({ content: encrypted.toString("hex") }),
    ` | Key Hash 1: ${iv.toString("hex")}\n | Text encrypted successfully`
  );

  fs.writeFileSync(
    `${__dirname}/output/${filename || "encrypted_text"}.key`,
    iv.toString("hex")
  );
}

function decryptFile(filename, hash, isText) {
  try {
    const file = JSON.parse(fs.readFileSync(`${filename}.drmdec`));
    const iv = Buffer.from(hash, "hex");
    const encryptedText = Buffer.from(file.content, "hex");

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    const outputFilename = `${__dirname}/output/${filename.replace(
      ".drmdec",
      ""
    )}${isText ? "_decrypted.txt" : ""}`;
    fs.writeFileSync(outputFilename, decrypted);

    console.log(
      "\x1b[32m",
      isText ? "Text decrypted successfully" : "File decrypted successfully"
    );
  } catch (err) {
    console.log("\x1b[41m%s\x1b[0m", isText ? "Invalid text" : "Invalid file");
    process.exit();
  }
}

function encryptText(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(text, "utf8")),
    cipher.final(),
  ]);

  return {
    keyHash: iv.toString("hex"),
    encryptedText: encrypted.toString("hex"),
  };
}

function decryptText(encryptedText, keyHash) {
  try {
    const iv = Buffer.from(keyHash, "hex");
    const encrypted = Buffer.from(encryptedText, "hex");
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    throw new Error("Invalid key or encrypted text");
  }
}

function handleUserChoice(choice) {
  switch (choice) {
    case "1":
      rl.question("Enter the file path or text: ", (input) => {
        encryptFile(input);
        rl.close();
      });
      break;
    case "2":
      rl.question(
        "Enter the file path or text (Without .drmdec): ",
        (input) => {
          const filename = input;
          rl.question("Enter the KEY: ", (input) => {
            const hash = input;
            decryptFile(filename, hash);
            rl.close();
          });
        }
      );
      break;
    case "3":
      rl.question("Enter the text to encrypt: ", (text) => {
        const { keyHash, encryptedText } = encryptText(text);
        console.log(
          "\x1b[31m",
          `+-------------------------------------------------------`
        );
        console.log(
          ` | Key Hash 1: ${keyHash}\n | Text (encrypted): ${encryptedText}\n | Text encrypted successfully`
        );
        console.log(
          " +-------------------------------------------------------"
        );
        rl.close();
      });
      break;
    case "4":
      rl.question("Enter the text to decrypt: ", (text) => {
        rl.question("Enter the KEY: ", (input) => {
          try {
            const decryptedText = decryptText(text, input);
            console.log("\x1b[32m", `Decrypted Text: ${decryptedText}`);
          } catch (error) {
            console.log("\x1b[41m%s\x1b[0m", "Invalid key or encrypted text");
          }
          rl.close();
        });
      });
      break;
    default:
      console.log("\x1b[41m%s\x1b[0m", "Invalid option");
      process.exit();
  }
}

if (process.argv[2] === "-e") {
  if (process.argv[3] === "-f") {
    encryptFile(process.argv[4]);
  } else if (process.argv[3] === "-t") {
    encryptFile(null, process.argv[4]);
  } else {
    rl.question("Enter file name or text: ", (filename) => {
      encryptFile(filename);
    });
  }
} else if (process.argv[2] === "-d") {
  if (process.argv[3] === "-f") {
    decryptFile(process.argv[4], process.argv[5]);
  } else if (process.argv[3] === "-t") {
    decryptFile(null, process.argv[4], true);
  } else {
    rl.question("Enter file name or text: ", (filename) => {
      rl.question("Enter key hash: ", (hash) => {
        decryptFile(filename, hash);
      });
    });
  }
} else {
  fs.readFile("lib/asci.txt", "utf8", function (err, data) {
    if (err) throw err;
    console.log(data);
    console.log("[1] Encrypt File");
    console.log("[2] Decrypt File");
    console.log("[3] Encrypt Text");
    console.log("[4] Decrypt Text");
  });

  rl.question("Select an option: ", handleUserChoice);
}
console.log("\x1b[0m");
