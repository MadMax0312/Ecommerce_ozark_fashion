const User = require("../models/userModel");
const bcrypt = require('bcrypt');


const securePassword = async (password) => {
  try {
    const saltRounds = 10; // You can adjust the number of salt rounds according to your security needs
    const passwordHash = await bcrypt.hash(password, saltRounds);
    return passwordHash;
  } catch (error) {
    console.error(error.message);
    throw error; // Rethrow the error to handle it at a higher level if needed
  }
}

const loadRegister = async(req,res) => {
  try{

    res.render("registration");

  } catch(error){
    console.log(error.message);
  }
};

const insertUser = async(req,res) => {
  console.log('Request Body:', req.body);
  try{
    console.log("ljhgghjg");
    console.log('Password from form:', req.body.password);
    const spassword = await securePassword(req.body.password)
    const user = new User({
      first_name:req.body.firstname,
      last_name:req.body.lastname,
      email:req.body.email,
      mobile:req.body.mno,
      password:spassword
    });

    const userData = await user.save();
    console.log(userData);

    if(userData){
      // sendVerifyMail(req.body.name, req.body.email, userData._id);
      res.redirect("/login");
    }else{
      res.render("registration", {message:"Oops! Your registration is failed"})
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
    // console.log('password:', password);

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

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin
  
}