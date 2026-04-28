const validator = require('validator');
const Validate = (data)=>{
        const mandatoryfield = ["FirstName", "emailId", "password"];
        const IsAllowed = mandatoryfield.every((ele)=> Object.keys(data).includes(ele));
         if(!IsAllowed){
            throw new Error("Field Missing");
         }
         if(!validator.isEmail(data.emailId)){
             throw new Error("Invalid Email");
         }
         if(!validator.isStrongPassword(data.password)){
             throw new Error("Weak password");
         }
         return true; 
}

module.exports = Validate;