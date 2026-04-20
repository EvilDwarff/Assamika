export const apiUrl = 'http://localhost/api'
export const apiPhoto = 'http://localhost/uploads/products'

export const adminToken = () => {
    const data = localStorage.getItem('adminInfo')
    const adminData = JSON.parse(data);
    return adminData.token;
}

// export const userToken = () => {
//     const data = localStorage.getItem('userInfo')
//     const userData = JSON.parse(data);
//     return userData.token;
// }

export const userToken = () => {
  try {
    const data = localStorage.getItem("userInfo"); 
    
    if (!data) return null;
const userData = JSON.parse(data);
return userData.token;
  } catch (e) {
    return null;
  }
};