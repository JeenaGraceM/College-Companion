const jwt=require('jsonwebtoken');

const DUMMY_USER = {
  _id: '689ae92cef93efa1a5eec4aa',
  fullName:"Ravi Kumar",
  dateOfBirth: new Date('1998-11-02T00:00:00.000+00:00'),
  email:"ravi.kumar@example.com",
  password:"MyP@ss9",
  role:"rep",
  branch:"ece",
  rollNumber:"ECE1892",
  createdAt: new Date('2025-08-12T07:11:40.471Z')

};


function generateDummyToken() {
    return jwt.sign(DUMMY_USER, process.env.JWT_SECRET || 'dummySecret', { expiresIn:'7d'} );
}

module.exports={generateDummyToken, DUMMY_USER};