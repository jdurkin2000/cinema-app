export function saveToken(token:string, remember:boolean){
  if (remember) localStorage.setItem("authToken", token);
  sessionStorage.setItem("authToken", token);
}
export function getToken(): string | null {
  return sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
}
export function clearToken(){
  sessionStorage.removeItem("authToken");
  localStorage.removeItem("authToken");
}
