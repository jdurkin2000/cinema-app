const authTokenIdentifier = "authToken";

export function saveToken(token:string, remember:boolean){
  if (remember) localStorage.setItem(authTokenIdentifier, token);
  sessionStorage.setItem(authTokenIdentifier, token);
  document.cookie = `${authTokenIdentifier}=${encodeURIComponent(token)}; path=/; Secure; SameSite=Lax`;
}
export function getToken(): string | null {
  return sessionStorage.getItem(authTokenIdentifier) || localStorage.getItem(authTokenIdentifier);
}
export function clearToken(){
  sessionStorage.removeItem(authTokenIdentifier);
  localStorage.removeItem(authTokenIdentifier);
  // Remove cookie
  document.cookie = `${authTokenIdentifier}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

