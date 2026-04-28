const validator = require('validator');

const Validate = (data) => {
  const { FirstName, emailId, password } = data;

  // 1️⃣ Check missing fields (more precise)
  if (!FirstName || !emailId || !password) {
    throw new Error("All fields are required (FirstName, emailId, password)");
  }

  // 2️⃣ Trim values (avoid invisible bugs)
  const trimmedName = FirstName.trim();
  const trimmedEmail = emailId.trim();

  // 3️⃣ Validate name
  if (trimmedName.length < 3) {
    throw new Error("FirstName must be at least 3 characters long");
  }

  // 4️⃣ Validate email
  if (!validator.isEmail(trimmedEmail)) {
    throw new Error("Invalid Email format");
  }

  // 5️⃣ Validate password (strong but realistic)
  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,   // relaxed (optional)
    minNumbers: 1,
    minSymbols: 0      // relaxed (optional)
  })) {
    throw new Error("Password must be at least 8 characters and include a number");
  }

  return true;
};

module.exports = Validate;