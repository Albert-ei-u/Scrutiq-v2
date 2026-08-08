const bcrypt = require("bcryptjs");

const test = async () => {
    const password = "Password!1";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log("Hash:", hash);
    const match = await bcrypt.compare(password, hash);
    console.log("Match:", match);
}

test();
