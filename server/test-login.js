const axios = require("axios");

const run = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
            email: "uwumuremyialbert70@gmail.com",
            password: "Password!1" // I don't know the password, but let's see if it finds the user
        });
        console.log(response.data);
    } catch (err) {
        if (err.response) {
            console.log("Status:", err.response.status);
            console.log("Data:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

run();
