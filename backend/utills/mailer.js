import nodemailer from 'nodemailer';

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"CampusBuzz" <${process.env.EMAIL}>`,
    to: email,
    subject: "Verify your OTP",
    text: `Your OTP is: ${otp}`,
    html: `Your OTP is: <b>${otp}</b>`,
  });

  console.log("Message sent:", info.messageId);
};

export default sendOTP;
