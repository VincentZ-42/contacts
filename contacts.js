const express = require("express");
const morgan = require("morgan");
const app = express();

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
// Acts middleware that lets us return the req.body value during every request/response cycle
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("new-contact");
});

function checkAlpha(str) {
	str = str.toLowerCase();
	let alphabet = "qwertyuiopasdfghjklzxcvbnm";
	for (let i = 0; i < str.length; i++) {
		if (!alphabet.includes(str[i])) {
			return false;
		}
	}
	return true;
}

function properPhoneFormat(phoneNum) {
	phoneNum = phoneNum.split('-');
  console.log(phoneNum);
	if (phoneNum.length !== 3) {
		return false;
	}
	phoneNum = phoneNum.join('');
  console.log(phoneNum);
	if (phoneNum.length !== 10) {
		return false;
	}
	let numbers = "0123456789";
	for (let i = 0; i < phoneNum.length; i++) {
		if (!numbers.includes(phoneNum[i])) {
			return false;
		}
	}
	return true;
}

function uniqueFullName(firstName, lastName) {
  firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
  lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();
  const fullName = firstName + " " + lastName;
  return !contactData.some(person => {
    let name = person.firstName + " " + person.lastName;
    if (name === fullName) return true;
  });
}

app.post("/contacts/new",
  (req, res, next) => {
    res.locals.errorMessages = [];
		for (const input in req.body) {
			req.body[input] = req.body[input].trim();
		}
    next();
  },
  (req, res, next) => {
    if (req.body.firstName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    }
		if (req.body.firstName.length > 25) {
			res.locals.errorMessages.push("Maximum length is 25 characters");
		}
		if (!checkAlpha(req.body.firstName)) {
			res.locals.errorMessages.push("First name must only be in alphabetic characters")
		}

    next();
  },
  (req, res, next) => {
    if (req.body.lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    }

		if (req.body.lastName.length > 25) {
			res.locals.errorMessages.push("Maximum length is 25 characters");
		}

		if (!checkAlpha(req.body.firstName)) {
			res.locals.errorMessages.push("Last name must only be in alphabetic characters")
		}

    if (!uniqueFullName(req.body.firstName, req.body.lastName)) {
			res.locals.errorMessages.push("Full Name must be unique");
		}

    next();
  },
  (req, res, next) => {
    if (req.body.phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone number is required.");
    }
		if (!properPhoneFormat(req.body.phoneNumber)) {
			res.locals.errorMessages.push("Phone number must match US-style phone number: ###-###-####");
		}

    next();
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("new-contact", {
        errorMessages: res.locals.errorMessages,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });

    res.redirect("/contacts");
  }
);

// app.post("/contacts/new", (req, res) => {
//   contactData.push({ ...req.body });
//   res.redirect("/contacts");
// });

// Longer implmentation of above app.post
// app.post("/contacts/new", (req, res) => {
//   // handle the form submission here
// 	contactData.push({
// 		firstName: req.body.firstName,
// 		lastName: req.body.lastName,
// 		phoneNumber: req.body.phoneNumber
// 	});

// 	res.redirect("/contacts");
// });

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000.");
});