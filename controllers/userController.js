const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const securePassword = async(password)=>{
  try{

   const passwordHash = await bcrypt.hash(password, 10);
   return passwordHash;

  }catch(error){
    console.log(error.message);
  }
}

//for send mail
const sendVerifyMail = async(email, otp)=>{

  try{

    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:'thahirmuhammedap@gmail.com',
        pass:'hpey gbkn ncbk yrju'
      }
    })
    const mailOptions = {
      from:'thahirmuhammedap@gmail.com',
      to:email,
      subject:'For verification of mail',
      html: `<p>Hii your OTP is: <strong>${otp}</strong> </p>`
    }
     await transporter.sendMail(mailOptions);

  }catch(error){
    console.log(error.message);
  }
};

//user otp
const loadOtpPage = async(req,res)=>{
  try {
      res.redirect('/otp');

  } catch (error) {
     console.log(error.message); 
  }
}


//ottp verification and otp storing in session
const verifyOtp = async(req,res)=>{

  try {

      console.log("fbhjgdahfj")
         // setting otp date and time
         const otpCode = generateOTP();
         console.log(otpCode);
         const otpExpiry = new Date();
         otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

         const userCheck = await User.findOne({email:req.body.email})
         if(userCheck)
         {
             res.send("User Already Exists");
         }else{

         const spassword = await securePassword(req.body.password);
          req.session.firstname = req.body.firstname;
          req.session.lastname = req.body.lastname;
          req.session.mobile = req.body.mno;
          req.session.email = req.body.email;
          
          if(req.body.firstname && req.body.email && req.body.lastname && req.body.mno){
              if(req.body.password === req.body.cpassword) {
                  req.session.password = spassword;
                  req.session.otp = {
                      code: otpCode,
                      expiry: otpExpiry,
                  };        
                      // Send OTP to the user's email
                      sendVerifyMail(req.session.email, req.session.otp.code);
                     
                      res.render("otp")
                  } else {
                      res.render("registration",{message: "Password doesn't match"})
                  }
              }
              else{
                  res.render("registration",{message: "Please enter all details"})
              }

          
         }
         
  } catch (error) {
      console.log(error); 
  }

}

//-----route to sign up page-----------------------------

const loadRegister = async(req,res) => {
  try{

    res.render("registration");

  } catch(error){
    console.log(error.message);
  }
};

//otp genarating
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


///-----Inserting user details in sign up page============

const insertUser = async(req,res) => {
  console.log('Request Body:', req.body);
  try{
    console.log("ljhgghjg");
    console.log('Password from form:', req.body.password);
    if(req.body.otp===req.session.otp.code){

    const user = new User({
      first_name:req.session.firstname,
      last_name:req.session.lastname,
      email:req.session.email,
      mobile:req.session.mobile,
      password: req.session.password,
      isVerified:1
    });

    const userData = await user.save();
    console.log(userData);
      res.render("login");
  }else {
    res.render('otp', {message:"Invalid OTP"})
  }
    
  }catch(error){
    console.log(error.message);
  }
};


//Login user methods started

const loginLoad = async(req,res)=>{

  try {

    res.render('login');

  }catch(error){
    console.log(error.message);
  }

};

const verifyLogin = async(req,res) => {

  try {

    const email = req.body.email;
    // console.log('email:', email);
    const password = req.body.password;
    console.log('password:', password);

    const userData = await User.findOne({email:email});
    console.log('userData:', userData);

    if(userData){

      const passwordMatch = await bcrypt.compare(password, userData.password);
      console.log('passwordMatch:', passwordMatch);
      
      if(passwordMatch){

      }else{
        res.render('login',{message:"Login details are incorrect"});
      }


    }else{
      res.render('login',{message:"Login details are incorrect"});
    }

  }catch(error){
    console.log(error.message);
  }
}

const loadOtp = async(req,res)=>{

  try {

    res.render('otp');

  }catch(error){
    console.log(error.message);
  }

};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadOtp,
  sendVerifyMail,
  verifyOtp,
  loadOtpPage
}