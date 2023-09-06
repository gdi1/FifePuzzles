const nodemailer = require("nodemailer");

/* 
Function used for sending emails. 
This is only called when a user wants to reset their password because they have forgotten it.
*/
const sendEmail = async (options) => {
  // use the Scholl of Computer Science's default email address
  const transporter = nodemailer.createTransport({
    host: "post.cs.st-andrews.ac.uk",
    port: 25,
  });

  // get the email address the mail will be sent to, the mail's subject and its body's content.
  const { to, subject, text } = options;

  const mailOptions = {
    // use the group's default no-reply email address
    from: process.env.EMAIL,
    to,
    subject,
    text,
  };

  // attempt to send the email
  await transporter.sendMail(mailOptions);
};

// exporting the function like this might seem cumbersome, but it was imposed by the testing process.
module.exports = { sendEmail };
