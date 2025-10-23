import axios from "axios";

const BASE = "http://localhost:8080";

export type LoginResp = { token: string; role: "ADMIN"|"USER"; name: string };

export async function register(data: {name:string;email:string;password:string;promotionsOptIn:boolean}) {
  await axios.post(`${BASE}/api/auth/register`, data);
}

export async function login(data: {email:string;password:string;rememberMe:boolean}): Promise<LoginResp> {
  const res = await axios.post(`${BASE}/api/auth/login`, data);
  return res.data;
}

export async function forgot(email: string) {
  await axios.post(`${BASE}/api/auth/forgot`, { email });
}

export async function resetPassword(token:string, newPassword:string){
  await axios.post(`${BASE}/api/auth/reset`, { token, newPassword });
}

export async function me(token:string){
  const res = await axios.get(`${BASE}/api/profile`, { headers: { Authorization:`Bearer ${token}` }});
  return res.data;
}

export async function updateProfile(token:string, body:any){
  const res = await axios.put(`${BASE}/api/profile`, body, { headers: { Authorization:`Bearer ${token}` }});
  return res.data;
}

export async function changePassword(token:string, currentPassword:string, newPassword:string){
  const res = await axios.post(`${BASE}/api/profile/password`, { currentPassword, newPassword }, { headers: { Authorization:`Bearer ${token}` }});
  return res.data;
}

export async function addCard(token:string, data:{number:string;expMonth:number;expYear:number;billingName:string;billingAddress:any}){
  const res = await axios.post(`${BASE}/api/profile/cards`, data, { headers: { Authorization:`Bearer ${token}` }});
  return res.data;
}

export async function removeCard(token:string, cardId:string){
  const res = await axios.delete(`${BASE}/api/profile/cards/${cardId}`, { headers: { Authorization:`Bearer ${token}` }});
  return res.data;
}
