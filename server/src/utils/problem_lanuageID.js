
const getLanguageById = (lang)=>{
        const language = {
             "c++": 54,
             "java": 62,
             "python": 71,
             "c": 50
        }
        return language[lang.toLowerCase()];
}
 

 
 module.exports = getLanguageById;