const axios = require('axios');

const submitBatch  = async(submissions)=>{
     const options = {
  method: 'POST',
  url: process.env.JUDGE0_API_URL,
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': process.env.RAPID_API_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();
}
 
const Wating =async (timer)=>{
     setTimeout(()=>{
        return 1;
     },timer);
}

const submitToken = async(token)=>{
      const options = {
  method: 'GET',
  url: process.env.JUDGE0_API_URL,
  params: {
    tokens: token.join(","), //send all the token in the form of string
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': process.env.RAPID_API_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
	   return response.data;
	} catch (error) {
		console.error(error);
	}
}
        while(true){
                 const result =  await fetchData();
                 const IsResultObtacin =  result.submissions.every((r)=> r.status_id > 2);
                 if(IsResultObtacin){
                 return result.submissions;
                }
                Wating(1000);
        }
   
}

module.exports = {submitBatch, submitToken};