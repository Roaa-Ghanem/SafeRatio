// import axios from 'axios';

// const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// // إنشاء instance لـ axios مع إعدادات مشتركة
// const api = axios.create({
//     baseURL: API_BASE,
//     timeout: 10000,
//     headers: {
//         'Content-Type': 'application/json',
//     }
// });

// // أضف interceptor لإضافة الـ token
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// export async function sendVerificationEmail(email) {
//     const url = `/api/auth/send-verification/`;
//     return api.post(url, { email });
// }

// export async function confirmEmail(uid, token) {
//     const url = `/api/auth/confirm-verification/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`;
//     return api.get(url);
// }

// export async function sendPasswordReset(email) {
//     const url = `/api/auth/send-reset/`;
//     return api.post(url, { email });
// }

// export async function resetPassword(uid, token, newPassword, newPassword2) {
//     const url = `/api/auth/reset-password/`;
//     return api.post(url, { uid, token, new_password: newPassword, new_password2: newPassword2 });
// }

// // ✅ **تحديث هذه الدوال لاستخدام المسار الصحيح**
// export async function getProfile() {
//     const url = `/api/auth/profile/`;  // تم التغيير من /api/auth/profile/
//     return api.get(url);
// }

// export async function updateProfile(payload) {
//     const url = `/api/auth/profile/`;  // تم التغيير من /api/auth/profile/
//     return api.put(url, payload);
// }

// // ✅ أضف دوال جديدة لخدمات المستخدم
// export async function uploadAvatar(avatarFile) {
//     const url = `/api/auth/upload-avatar/`;
//     const formData = new FormData();
//     formData.append('avatar', avatarFile);
    
//     return api.post(url, formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data'
//         }
//     });
// }

// export async function deleteAvatar() {
//     const url = `/api/users/upload-avatar/`;
//     return api.delete(url);
// }

// export async function getSensitiveInfoStatus() {
//     const url = `/api/users/sensitive-info/`;
//     return api.get(url);
// }

// export async function completeSensitiveInfo(sensitiveData) {
//     const url = `/api/users/sensitive-info/`;
//     return api.post(url, sensitiveData);
// }

// export async function getVehicleInsuranceData() {
//     const url = `/api/car-insurance/vehicles/`;
//     return api.get(url);
// }

// export async function addVehicle(vehicleData) {
//     const url = `/api/car-insurance/vehicles/`;
//     return api.post(url, vehicleData);
// }

// export default {
//     sendVerificationEmail,
//     confirmEmail,
//     sendPasswordReset,
//     resetPassword,
//     getProfile,
//     updateProfile,
//     uploadAvatar,
//     deleteAvatar,
//     getSensitiveInfoStatus,
//     completeSensitiveInfo,
//     getVehicleInsuranceData,
//     addVehicle
// };